import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const FROM_EMAIL = 'noreply@rekruit.net'
const APP_NAME = 'rekruit'

interface EmailHookPayload {
  user: { email: string; user_metadata?: Record<string, string> }
  email_data: {
    token: string
    token_hash: string
    redirect_to: string
    email_action_type: string
    site_url: string
  }
}

const templates: Record<string, (payload: EmailHookPayload) => { subject: string; html: string }> = {
  recovery: ({ email_data }) => ({
    subject: 'Réinitialisation de votre mot de passe – rekruit',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc">
        <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
            <div style="width:32px;height:32px;background:#2563eb;border-radius:8px;display:flex;align-items:center;justify-content:center">
              <span style="color:#fff;font-weight:700;font-size:14px">R</span>
            </div>
            <span style="font-weight:700;font-size:18px;color:#0f172a">rekruit</span>
          </div>
          <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px">Réinitialisation du mot de passe</h2>
          <p style="color:#64748b;font-size:14px;margin:0 0 24px">Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien expire dans 1 heure.</p>
          <a href="${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=recovery&redirect_to=${email_data.redirect_to}"
             style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px">
            Réinitialiser mon mot de passe
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
      </div>`,
  }),
  signup: ({ email_data }) => ({
    subject: 'Confirmez votre adresse email – rekruit',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc">
        <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
            <div style="width:32px;height:32px;background:#2563eb;border-radius:8px;display:flex;align-items:center;justify-content:center">
              <span style="color:#fff;font-weight:700;font-size:14px">R</span>
            </div>
            <span style="font-weight:700;font-size:18px;color:#0f172a">rekruit</span>
          </div>
          <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px">Bienvenue sur rekruit 🎉</h2>
          <p style="color:#64748b;font-size:14px;margin:0 0 24px">Confirmez votre adresse email pour activer votre compte et commencer à recruter.</p>
          <a href="${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=signup&redirect_to=${email_data.redirect_to}"
             style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px">
            Confirmer mon email
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">Ce lien expire dans 24 heures.</p>
        </div>
      </div>`,
  }),
  email_change: ({ email_data }) => ({
    subject: 'Confirmez votre nouvel email – rekruit',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc">
        <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
            <div style="width:32px;height:32px;background:#2563eb;border-radius:8px;display:flex;align-items:center;justify-content:center">
              <span style="color:#fff;font-weight:700;font-size:14px">R</span>
            </div>
            <span style="font-weight:700;font-size:18px;color:#0f172a">rekruit</span>
          </div>
          <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px">Changement d'adresse email</h2>
          <p style="color:#64748b;font-size:14px;margin:0 0 24px">Confirmez votre nouvelle adresse email en cliquant sur le bouton ci-dessous.</p>
          <a href="${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=email_change&redirect_to=${email_data.redirect_to}"
             style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px">
            Confirmer mon nouvel email
          </a>
        </div>
      </div>`,
  }),
}

serve(async (req) => {
  try {
    const payload: EmailHookPayload = await req.json()
    const { user, email_data } = payload
    const type = email_data.email_action_type

    const template = templates[type]
    if (!template) {
      return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), { status: 400 })
    }

    const { subject, html } = template(payload)

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: `${APP_NAME} <${FROM_EMAIL}>`, to: [user.email], subject, html }),
    })

    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ error: err }), { status: 500 })
    }

    return new Response('{}', { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
