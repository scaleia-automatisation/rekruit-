import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const FROM_EMAIL = 'noreply@rekruit.net'

async function sendEmail(to: string, subject: string, html: string) {
  if (!to || !RESEND_API_KEY) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: `rekruit <${FROM_EMAIL}>`, to: [to], subject, html }),
  })
}

function notifHtml(title: string, body: string) {
  return `
    <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f8fafc">
      <div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px">
          <div style="width:32px;height:32px;background:#2563eb;border-radius:8px;display:flex;align-items:center;justify-content:center">
            <span style="color:#fff;font-weight:700;font-size:14px">R</span>
          </div>
          <span style="font-weight:700;font-size:18px;color:#0f172a">rekruit</span>
        </div>
        <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 16px">${title}</h2>
        <div style="color:#1e293b;font-size:14px;line-height:1.7">${body}</div>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px">
        Envoyé via <a href="https://rekruit.net" style="color:#94a3b8">rekruit.net</a>
      </p>
    </div>`
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return new Response(JSON.stringify({ error: 'Token manquant' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    if (req.method === 'GET') {
      const { data: tokenData, error } = await supabase
        .from('interview_tokens')
        .select(`
          *,
          interview:interviews(
            id,
            interview_number,
            candidate:candidates(first_name, last_name),
            job_offer:job_offers(title, company)
          )
        `)
        .eq('token', token)
        .single()

      if (error || !tokenData) {
        return new Response(JSON.stringify({ error: 'Lien invalide ou expiré' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { data: slots } = await supabase
        .from('interview_slots')
        .select('*')
        .eq('interview_id', tokenData.interview_id)
        .order('slot_datetime')

      return new Response(JSON.stringify({ token: tokenData, slots }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { slot_id, action } = body

      // Load token with full context
      const { data: tokenData } = await supabase
        .from('interview_tokens')
        .select(`
          *,
          interview:interviews(
            id,
            interview_number,
            candidate:candidates(id, first_name, last_name),
            job_offer:job_offers(title, company)
          )
        `)
        .eq('token', token)
        .single()

      if (!tokenData || tokenData.status !== 'pending') {
        return new Response(JSON.stringify({ error: 'Ce lien a déjà été utilisé' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get organization email for notification
      const { data: org } = await supabase
        .from('organizations')
        .select('email, name')
        .eq('id', tokenData.organization_id)
        .single()

      const iv = tokenData.interview
      const candidate = iv?.candidate
      const jobOffer = iv?.job_offer
      const candidateName = candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Le candidat'

      // ── Slot confirmation ──────────────────────────────────────────────
      if (slot_id) {
        await supabase
          .from('interview_tokens')
          .update({ status: 'accepted', selected_slot_id: slot_id, response_at: new Date().toISOString() })
          .eq('token', token)

        await supabase
          .from('interview_slots')
          .update({ status: 'confirmed' })
          .eq('id', slot_id)

        await supabase
          .from('interviews')
          .update({ status: 'scheduled' })
          .eq('id', tokenData.interview_id)

        // Get slot label for notification
        const { data: slot } = await supabase
          .from('interview_slots')
          .select('label, slot_datetime')
          .eq('id', slot_id)
          .single()

        const slotLabel = slot?.label || slot?.slot_datetime || 'créneau sélectionné'

        if (org?.email) {
          await sendEmail(
            org.email,
            `✅ ${candidateName} a confirmé un créneau d'entretien`,
            notifHtml(
              `Créneau confirmé — Entretien ${iv?.interview_number}`,
              `<p><strong>${candidateName}</strong> a choisi un créneau pour le poste <strong>${jobOffer?.title}</strong>${jobOffer?.company ? ` chez ${jobOffer.company}` : ''} :</p>
               <p style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:0 8px 8px 0;font-weight:600;color:#15803d">${slotLabel}</p>
               <p>Connectez-vous à rekruit pour confirmer les détails de l'entretien.</p>`
            )
          )
        }

        return new Response(JSON.stringify({ success: true, result: 'slot_confirmed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // ── Not available / Not looking ────────────────────────────────────
      if (action === 'not_available' || action === 'not_looking') {
        const candidateStatus = action === 'not_available' ? 'unavailable' : 'not_looking'

        await supabase
          .from('interview_tokens')
          .update({ status: 'declined', response_at: new Date().toISOString() })
          .eq('token', token)

        if (candidate?.id) {
          await supabase
            .from('candidates')
            .update({ status: candidateStatus })
            .eq('id', candidate.id)
        }

        const actionLabel = action === 'not_available'
          ? 'n\'est pas disponible aux dates proposées'
          : 'ne recherche plus d\'emploi'

        const actionEmoji = action === 'not_available' ? '📅' : '🔕'
        const subjectLine = action === 'not_available'
          ? `📅 ${candidateName} n'est pas disponible aux dates proposées`
          : `🔕 ${candidateName} ne recherche plus d'emploi`

        const badgeColor = action === 'not_available' ? '#f59e0b' : '#ef4444'
        const badgeBg = action === 'not_available' ? '#fffbeb' : '#fef2f2'
        const badgeBorder = action === 'not_available' ? '#f59e0b' : '#ef4444'

        if (org?.email) {
          await sendEmail(
            org.email,
            subjectLine,
            notifHtml(
              `${actionEmoji} Réponse du candidat — Entretien ${iv?.interview_number}`,
              `<p><strong>${candidateName}</strong> a répondu à l'invitation d'entretien pour le poste <strong>${jobOffer?.title}</strong>${jobOffer?.company ? ` chez ${jobOffer.company}` : ''} :</p>
               <p style="background:${badgeBg};border-left:4px solid ${badgeBorder};padding:12px 16px;border-radius:0 8px 8px 0;font-weight:600;color:${badgeColor}">${candidateName} ${actionLabel}</p>
               <p>Son profil a été mis à jour dans votre pipeline rekruit. Connectez-vous pour consulter votre tableau de bord.</p>`
            )
          )
        }

        return new Response(JSON.stringify({ success: true, result: action }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ error: 'Action non reconnue' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Méthode non supportée' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
