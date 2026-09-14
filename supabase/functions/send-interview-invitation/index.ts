import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const FROM_EMAIL = 'bonjour@rekruit.net'
const APP_NAME = 'rekruit'

interface SlotData {
  id: string
  label: string
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, body, token_url, slots_data, from_name, reply_to } = await req.json()

    if (!to || !subject || !body) {
      return new Response(JSON.stringify({ error: 'Paramètres manquants: to, subject, body requis' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // "Acme Corp via rekruit" or fallback to "rekruit"
    const senderName = from_name ? `${from_name} via ${APP_NAME}` : APP_NAME

    // Convert plain text / basic markdown to HTML (email-safe)
    let htmlBody = body
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" style="color:#2563eb">$1</a>')
      .replace(/\n/g, '<br>')

    // Build inline links block and replace [CRÉNEAUX] placeholder, or append at end
    let plainTextSlots = ''
    if (token_url && slots_data && Array.isArray(slots_data) && slots_data.length > 0) {
      const slotLinks = (slots_data as SlotData[]).map(slot =>
        `<a href="${token_url}?slot=${slot.id}" style="display:block;color:#2563eb;font-weight:700;text-decoration:underline;font-size:14px;margin-bottom:10px">&#128197; ${slot.label}</a>`
      ).join('')

      const linksBlock = `<div style="margin:16px 0">${slotLinks}<a href="${token_url}?action=not_available" style="display:block;color:#2563eb;font-weight:700;text-decoration:underline;font-size:14px;margin-bottom:6px;margin-top:6px">&#128197; Je ne suis pas disponible &agrave; ces dates</a><a href="${token_url}?action=not_looking" style="display:block;color:#2563eb;font-weight:700;text-decoration:underline;font-size:14px">&#128277; Je ne recherche plus d&apos;emploi</a></div>`

      if (body.includes('[CRÉNEAUX]')) {
        htmlBody = htmlBody.replace('[CRÉNEAUX]', linksBlock)
      } else {
        htmlBody += linksBlock
      }

      plainTextSlots = '\n\nCréneaux disponibles :\n' +
        (slots_data as SlotData[]).map(s => `- ${s.label} : ${token_url}?slot=${s.id}`).join('\n') +
        `\n\n- Je ne suis pas disponible à ces dates : ${token_url}?action=not_available` +
        `\n- Je ne recherche plus d'emploi : ${token_url}?action=not_looking`
    }

    // Email-client-safe HTML (no flexbox — use inline-block instead)
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" width="100%" style="max-width:560px" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">

              <!-- Logo -->
              <div style="margin-bottom:28px">
                <span style="display:inline-block;width:32px;height:32px;background:#2563eb;border-radius:8px;text-align:center;line-height:32px;vertical-align:middle;margin-right:10px">
                  <span style="color:#ffffff;font-weight:700;font-size:14px;line-height:32px">R</span>
                </span>
                <span style="font-weight:700;font-size:18px;color:#0f172a;vertical-align:middle">rekruit</span>
              </div>

              <!-- Body + liens créneaux -->
              <div style="color:#1e293b;font-size:14px;line-height:1.7">${htmlBody}</div>

            </td>
          </tr>
          <tr>
            <td style="padding-top:16px;text-align:center">
              <p style="color:#94a3b8;font-size:12px;margin:0">
                Envoy&eacute; via <a href="https://rekruit.net" style="color:#94a3b8;text-decoration:none">rekruit.net</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    // Plain text fallback — improves deliverability
    const plainText = body + plainTextSlots + '\n\n--\nEnvoyé via rekruit.net'

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: `${senderName} <${FROM_EMAIL}>`,
        to: [to],
        subject,
        html,
        text: plainText,
        ...(reply_to ? { reply_to } : {}),
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Resend error: ${err}`)
    }

    const result = await res.json()
    return new Response(JSON.stringify({ id: result.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
