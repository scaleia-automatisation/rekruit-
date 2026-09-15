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
    const {
      candidate,
      job_offer,
      interview_number,
      interview_duration,
      cv_text,
      ai_summary,
      ai_strengths,
      ai_weaknesses,
      missing_skills,
    } = await req.json()

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    const model = Deno.env.get('AI_MODEL') || 'gpt-4o'

    const durationLabel = interview_duration ? `${interview_duration} minutes` : '45 minutes'

    const cvSection = cv_text
      ? `\nCV du candidat :\n${cv_text.slice(0, 3000)}`
      : ''

    const aiSection = [
      ai_summary ? `Résumé IA : ${ai_summary}` : '',
      ai_strengths ? `Points forts : ${ai_strengths}` : '',
      ai_weaknesses ? `Points faibles : ${ai_weaknesses}` : '',
      missing_skills ? `Compétences manquantes : ${missing_skills}` : '',
    ].filter(Boolean).join('\n')

    const prompt = `Tu es un expert RH préparant un entretien de recrutement.

Contexte :
- Candidat : ${candidate?.first_name} ${candidate?.last_name}
- Poste : ${job_offer?.title} chez ${job_offer?.company}
${job_offer?.description ? `- Description du poste : ${job_offer.description.slice(0, 1000)}` : ''}
${job_offer?.skills ? `- Compétences requises : ${job_offer.skills}` : ''}
${job_offer?.experience ? `- Expérience requise : ${job_offer.experience}` : ''}
- Numéro de l'entretien : ${interview_number || 1}
- Durée de l'entretien : ${durationLabel}
${aiSection ? `\nAnalyse IA du profil :\n${aiSection}` : ''}
${cvSection}

Ta mission : Générer un questionnaire d'entretien personnalisé et stratégique pour ce recruteur.

Règles :
- Choisis le nombre optimal de questions entre 7 et 30 selon la durée (${durationLabel})
- Mix de catégories : motivation, compétences techniques, expérience, comportemental, situationnel, culture fit
- Priorise les questions qui révèlent ce que le CV ne dit pas
- Si des points faibles ou compétences manquantes sont identifiés, génère des questions ciblées dessus
- Les questions doivent être ouvertes, précises, et pertinentes pour ce poste spécifique
- Chaque question doit avoir un objectif clair pour le recruteur

Réponds UNIQUEMENT avec un JSON valide :
{
  "questions": [
    {
      "question": "texte de la question",
      "category": "motivation|competences|experience|comportemental|situationnel|culture_fit",
      "tip": "ce que cette question permet de détecter (1 phrase courte)"
    }
  ]
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const content = data.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
