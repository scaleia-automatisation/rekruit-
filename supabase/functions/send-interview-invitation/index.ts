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
    const htmlBody = body
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" style="color:#2563eb">$1</a>')
      .replace(/\n/g, '<br>')

    // Build interactive buttons section when slots are provided
    let buttonsSection = ''
    let plainTextSlots = ''
    if (token_url && slots_data && Array.isArray(slots_data) && slots_data.length > 0) {
      const slotButtons = (slots_data as SlotData[]).map(slot => `
        <a href="${token_url}?slot=${slot.id}"
           style="display:block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 20px;border-radius:12px;font-weight:600;font-size:14px;margin-bottom:10px;text-align:center;mso-padding-alt:14px 20px">
          &#128197; ${slot.label}
        </a>`).join('')

      buttonsSection = `
        <div style="margin-top:28px;border-top:1px solid #e2e8f0;padding-top:24px">
          <p style="font-weight:700;font-size:14px;color:#0f172a;margin:0 0 14px 0">Choisissez votre cr&eacute;neau&nbsp;:</p>
          ${slotButtons}

          <div style="border-top:1px dashed #e2e8f0;margin:20px 0 16px 0"></div>
          <p style="font-size:12px;color:#94a3b8;margin:0 0 12px 0;text-align:center">Ou signalez votre situation&nbsp;:</p>

          <a href="${token_url}?action=not_available"
             style="display:block;background:#fffbeb;color:#92400e;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:600;font-size:13px;margin-bottom:8px;text-align:center;border:1.5px solid #f59e0b">
            &#128197; Je ne suis pas disponible &agrave; ces dates
          </a>
          <p style="font-size:11px;color:#94a3b8;text-align:center;margin:0 0 16px 0">Le recruteur sera inform&eacute; et pourra vous proposer d&apos;autres cr&eacute;neaux</p>

          <a href="${token_url}?action=not_looking"
             style="display:block;background:#ffffff;color:#64748b;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:600;font-size:13px;text-align:center;border:1.5px solid #e2e8f0">
            &#128277; Je ne recherche plus d&apos;emploi
          </a>
          <p style="font-size:11px;color:#94a3b8;text-align:center;margin:4px 0 0 0">Votre candidature sera archiv&eacute;e</p>
        </div>`

      plainTextSlots = '\n\nChoisissez votre créneau :\n' +
        (slots_data as SlotData[]).map(s => `- ${s.label} : ${token_url}?slot=${s.id}`).join('\n') +
        `\n\nJe ne suis pas disponible à ces dates : ${token_url}?action=not_available` +
        `\nJe ne recherche plus d'emploi : ${token_url}?action=not_looking`
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

              <!-- Body -->
              <div style="color:#1e293b;font-size:14px;line-height:1.7">${htmlBody}</div>

              <!-- Slot buttons -->
              ${buttonsSection}

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
