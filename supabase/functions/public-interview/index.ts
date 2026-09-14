import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const FROM_EMAIL = 'bonjour@rekruit.net'

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
        <div style="margin-bottom:28px">
          <span style="display:inline-block;width:32px;height:32px;background:#2563eb;border-radius:8px;text-align:center;line-height:32px;vertical-align:middle;margin-right:10px">
            <span style="color:#fff;font-weight:700;font-size:14px">R</span>
          </span>
          <span style="font-weight:700;font-size:18px;color:#0f172a;vertical-align:middle">rekruit</span>
        </div>
        <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 16px">${title}</h2>
        <div style="color:#1e293b;font-size:14px;line-height:1.7">${body}</div>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px">
        Envoy&eacute; via <a href="https://rekruit.net" style="color:#94a3b8">rekruit.net</a>
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
        .order('datetime')

      return new Response(JSON.stringify({ token: tokenData, slots }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { slot_id, action } = body

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

      // Resolve recruiter email: use stored recruiter_email, fallback to users table
      let recruiterEmail: string | null = tokenData.recruiter_email || null
      let recruiterUserId: string | null = null

      if (!recruiterEmail) {
        const { data: recruiterUser } = await supabase
          .from('users')
          .select('id, email')
          .eq('organization_id', tokenData.organization_id)
          .limit(1)
          .single()
        recruiterEmail = recruiterUser?.email || null
        recruiterUserId = recruiterUser?.id || null
      } else {
        const { data: recruiterUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', recruiterEmail)
          .limit(1)
          .single()
        recruiterUserId = recruiterUser?.id || null
      }

      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', tokenData.organization_id)
        .single()

      const iv = tokenData.interview
      const candidate = iv?.candidate
      const jobOffer = iv?.job_offer
      const candidateName = candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Le candidat'

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

        const { data: slot } = await supabase
          .from('interview_slots')
          .select('label, datetime')
          .eq('id', slot_id)
          .single()

        const slotLabel = slot?.label || slot?.datetime || 'créneau sélectionné'

        const notifTitle = `✅ ${candidateName} a confirmé un créneau`
        const notifContent = `${candidateName} a choisi le créneau "${slotLabel}" pour le poste ${jobOffer?.title}${jobOffer?.company ? ` chez ${jobOffer.company}` : ''}.`

        await supabase.from('notifications').insert({
          organization_id: tokenData.organization_id,
          user_id: recruiterUserId,
          type: 'interview_confirmed',
          title: notifTitle,
          content: notifContent,
        })

        await supabase.from('messages').insert({
          candidate_id: candidate?.id,
          organization_id: tokenData.organization_id,
          type: 'email',
          subject: `Réponse candidat : créneau confirmé — ${slotLabel}`,
          content: `${candidateName} a confirmé le créneau : ${slotLabel}`,
          channel: 'inbound',
          status: 'delivered',
          sent_at: new Date().toISOString(),
        })

        if (recruiterEmail) {
          await sendEmail(
            recruiterEmail,
            `✅ ${candidateName} a confirmé un créneau d'entretien`,
            notifHtml(
              `Créneau confirmé — Entretien ${iv?.interview_number}`,
              `<p><strong>${candidateName}</strong> a choisi un créneau pour le poste <strong>${jobOffer?.title}</strong>${jobOffer?.company ? ` chez ${jobOffer.company}` : ''} :</p>
               <p style="background:#f0fdf4;border-left:4px solid #22c55e;padding:12px 16px;border-radius:0 8px 8px 0;font-weight:600;color:#15803d">${slotLabel}</p>
               <p>Connectez-vous &agrave; rekruit pour confirmer les d&eacute;tails de l&apos;entretien.</p>`
            )
          )
        }

        return new Response(JSON.stringify({ success: true, result: 'slot_confirmed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

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

        const notifTitle = `${actionEmoji} ${candidateName} ${actionLabel}`
        const notifContent = `${candidateName} a répondu à l'invitation pour le poste ${jobOffer?.title}${jobOffer?.company ? ` chez ${jobOffer.company}` : ''} : ${actionLabel}.`

        await supabase.from('notifications').insert({
          organization_id: tokenData.organization_id,
          user_id: recruiterUserId,
          type: action === 'not_available' ? 'candidate_unavailable' : 'candidate_not_looking',
          title: notifTitle,
          content: notifContent,
        })

        await supabase.from('messages').insert({
          candidate_id: candidate?.id,
          organization_id: tokenData.organization_id,
          type: 'email',
          subject: action === 'not_available' ? 'Réponse candidat : non disponible à ces dates' : 'Réponse candidat : ne recherche plus d\'emploi',
          content: `${candidateName} ${actionLabel}`,
          channel: 'inbound',
          status: 'delivered',
          sent_at: new Date().toISOString(),
        })

        if (recruiterEmail) {
          await sendEmail(
            recruiterEmail,
            subjectLine,
            notifHtml(
              `${actionEmoji} Réponse du candidat — Entretien ${iv?.interview_number}`,
              `<p><strong>${candidateName}</strong> a r&eacute;pondu &agrave; l&apos;invitation d&apos;entretien pour le poste <strong>${jobOffer?.title}</strong>${jobOffer?.company ? ` chez ${jobOffer.company}` : ''} :</p>
               <p style="background:${badgeBg};border-left:4px solid ${badgeBorder};padding:12px 16px;border-radius:0 8px 8px 0;font-weight:600;color:${badgeColor}">${candidateName} ${actionLabel}</p>
               <p>Son profil a &eacute;t&eacute; mis &agrave; jour dans votre pipeline rekruit. Connectez-vous pour consulter votre tableau de bord.</p>`
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
