import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const FROM_EMAIL = 'noreply@rekruit.net'
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
    const { to, subject, body, token_url, slots_data } = await req.json()

    if (!to || !subject || !body) {
      return new Response(JSON.stringify({ error: 'Paramètres manquants: to, subject, body requis' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Convert plain text / basic markdown to HTML
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
    if (token_url && slots_data && Array.isArray(slots_data) && slots_data.length > 0) {
      const slotButtons = (slots_data as SlotData[]).map(slot => `
        <a href="${token_url}?slot=${slot.id}"
           style="display:block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 20px;border-radius:12px;font-weight:600;font-size:14px;margin-bottom:10px;text-align:center">
          📅 ${slot.label}
        </a>`).join('')

      buttonsSection = `
        <div style="margin-top:28px;border-top:1px solid #e2e8f0;padding-top:24px">
          <p style="font-weight:700;font-size:14px;color:#0f172a;margin:0 0 14px">Choisissez votre créneau :</p>
          ${slotButtons}

          <div style="border-top:1px dashed #e2e8f0;margin:20px 0 16px"></div>
          <p style="font-size:12px;color:#94a3b8;margin:0 0 12px">Ou signalez votre situation :</p>

          <a href="${token_url}?action=not_available"
             style="display:block;background:#fff;color:#92400e;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:600;font-size:13px;margin-bottom:8px;text-align:center;border:1.5px solid #f59e0b">
            🗓 Je ne suis pas disponible à ces dates
          </a>
          <p style="font-size:11px;color:#94a3b8;text-align:center;margin:0 0 16px">Le recruteur sera informé et pourra vous proposer d'autres créneaux</p>

          <a href="${token_url}?action=not_looking"
             style="display:block;background:#fff;color:#64748b;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:600;font-size:13px;text-align:center;border:1.5px solid #e2e8f0">
            🔕 Je ne recherche plus d'emploi
          </a>
          <p style="font-size:11px;color:#94a3b8;text-align:center;margin:4px 0 0">Votre candidature sera archivée</p>
        </div>`
    }

    const html = `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f8fafc">
        <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px">
            <div style="width:32px;height:32px;background:#2563eb;border-radius:8px;display:flex;align-items:center;justify-content:center">
              <span style="color:#fff;font-weight:700;font-size:14px">R</span>
            </div>
            <span style="font-weight:700;font-size:18px;color:#0f172a">rekruit</span>
          </div>
          <div style="color:#1e293b;font-size:14px;line-height:1.7">${htmlBody}</div>
          ${buttonsSection}
        </div>
        <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px">
          Envoyé via <a href="https://rekruit.net" style="color:#94a3b8">rekruit.net</a>
        </p>
      </div>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: `${APP_NAME} <${FROM_EMAIL}>`, to: [to], subject, html }),
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
