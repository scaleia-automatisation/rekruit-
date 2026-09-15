import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, candidate, job_offer, slots, interview_link, interview_type, interview_duration, interviewers } = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    const model = Deno.env.get('AI_MODEL') || 'gpt-4o'

    const slotsText = slots?.map((s: { label: string }, i: number) => `Option ${i + 1}: ${s.label}`).join('\n') || ''

    const interviewTypeLabel: Record<string, string> = {
      visio: 'en visioconférence',
      presentiel: 'en présentiel',
      phone: 'par téléphone',
    }
    const typeLabel = interviewTypeLabel[interview_type] || 'en visioconférence'
    const durationLabel = interview_duration ? `${interview_duration} minutes` : '45 minutes'

    const interviewersLine = Array.isArray(interviewers) && interviewers.length > 0
      ? `- Intervieweur(s) : ${interviewers.map((iv: { first_name: string; last_name: string; job_title?: string }) => `${iv.first_name} ${iv.last_name}${iv.job_title ? ` (${iv.job_title})` : ''}`).join(', ')}`
      : ''

    const prompts: Record<string, string> = {
      interview_invitation: `Rédige un email professionnel et chaleureux pour inviter ${candidate?.first_name} ${candidate?.last_name} à un entretien pour le poste de ${job_offer?.title} chez ${job_offer?.company}.

Modalités de l'entretien :
- Format : ${typeLabel}
- Durée prévue : ${durationLabel}
${interviewersLine}

Les créneaux proposés sont :
${slotsText}

IMPORTANT :
- Mentionne le format (${typeLabel}) et la durée (${durationLabel}) de l'entretien dans le corps de l'email.
${interviewersLine ? `- Mentionne avec qui le candidat aura l'entretien (${interviewers.map((iv: { first_name: string; last_name: string; job_title?: string }) => `${iv.first_name} ${iv.last_name}${iv.job_title ? `, ${iv.job_title}` : ''}`).join(' et ')}).` : ''}
- Ne mentionne PAS de lien ni d'URL dans le message.
- Ne liste PAS les dates/heures des créneaux telles quelles dans le texte.
- À l'endroit exact où les créneaux doivent apparaître (après une phrase d'introduction et AVANT la phrase de clôture type "Dans l'attente"), écris UNIQUEMENT le mot-clé : [CRÉNEAUX]
- Ce placeholder sera automatiquement remplacé par les liens cliquables.
- L'email doit être court, chaleureux et professionnel.
- Signe avec l'équipe RH.`,

      shortlist: `Rédige un email pour informer ${candidate?.first_name} ${candidate?.last_name} que sa candidature pour le poste de ${job_offer?.title} chez ${job_offer?.company} a été présélectionnée. Message court et encourageant.`,

      rejection: `Rédige un email de refus bienveillant et professionnel pour ${candidate?.first_name} ${candidate?.last_name} concernant sa candidature pour le poste de ${job_offer?.title} chez ${job_offer?.company}. Message court, respectueux, qui encourage le candidat pour la suite de ses recherches et lui souhaite bonne chance.`,

      hired: `Rédige un email chaleureux et professionnel pour féliciter ${candidate?.first_name} ${candidate?.last_name} et lui annoncer qu'il/elle a été retenu(e) pour le poste de ${job_offer?.title} chez ${job_offer?.company}. Exprime l'enthousiasme de l'équipe à l'idée de l'accueillir, et indique que l'équipe RH le/la contactera prochainement pour les prochaines étapes (contrat, date de démarrage). Message chaleureux, motivant et professionnel.`,

      offer: `Rédige un email pour proposer une offre d'emploi à ${candidate?.first_name} ${candidate?.last_name} pour le poste de ${job_offer?.title} chez ${job_offer?.company}. Message chaleureux et professionnel.`,
    }

    const prompt = prompts[type] || `Rédige un email professionnel à ${candidate?.first_name} ${candidate?.last_name} concernant sa candidature.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `${prompt}\n\nRéponds UNIQUEMENT avec le texte de l'email, sans commentaire, sans sujet, juste le corps de l'email.`
        }]
      })
    })

    const data = await response.json()
    const message = data.choices[0].message.content

    const subjects: Record<string, string> = {
      interview_invitation: `Invitation à un entretien - ${job_offer?.title}`,
      shortlist: `Votre candidature a été présélectionnée - ${job_offer?.title}`,
      rejection: `Suite à votre candidature - ${job_offer?.title}`,
      hired: `Félicitations - Offre d'emploi acceptée - ${job_offer?.title}`,
      offer: `Offre d'emploi - ${job_offer?.title}`,
    }

    return new Response(JSON.stringify({
      subject: subjects[type] || `Concernant votre candidature - ${job_offer?.title}`,
      message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
