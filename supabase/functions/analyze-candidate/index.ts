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
    const { cv_text, cv_base64, cv_media_type, cover_letter_text, job_offer } = await req.json()
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    const model = Deno.env.get('AI_MODEL') || 'gpt-4o'

    const jobContext = job_offer
      ? `\n\nOffre d'emploi ciblée:\nPoste: ${job_offer.title}\nEntreprise: ${job_offer.company}\nDescription: ${job_offer.description || ''}\nCompétences requises: ${job_offer.skills || ''}\nExpérience: ${job_offer.experience || ''}`
      : ''

    const prompt = `${jobContext}

Analyse ce candidat et réponds UNIQUEMENT avec un JSON valide:
{
  "first_name": "prénom",
  "last_name": "nom",
  "email": "email si trouvé",
  "phone": "téléphone si trouvé",
  "location": "ville/pays",
  "current_title": "poste actuel",
  "years_experience": nombre,
  "education_level": "Bac+2|Bac+3|Bac+5|Doctorat|Autre",
  "score_global": score de 0 à 100,
  "score_skills": score compétences de 0 à 100,
  "score_experience": score expérience de 0 à 100,
  "score_education": score formation de 0 à 100,
  "score_job_match": score adéquation au poste de 0 à 100,
  "score_letter": score lettre de motivation de 0 à 100 (null si pas de lettre),
  "recommendation": "GO|MAYBE|NO",
  "ai_summary": "résumé du profil en 2-3 phrases",
  "ai_strengths": "points forts du candidat",
  "ai_weaknesses": "points à améliorer ou manquants",
  "missing_skills": "compétences clés manquantes par rapport à l'offre",
  "progression": 20,
  "experiences": [{"title": "", "company": "", "duration": "", "description": ""}],
  "educations": [{"degree": "", "school": "", "year": ""}],
  "skills": ["skill1", "skill2"]
}`

    // Build message content — OpenAI supports image base64 but not PDF natively
    type ContentPart =
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } }

    const userContent: ContentPart[] = []

    if (cv_base64 && cv_media_type && cv_media_type.startsWith('image/')) {
      userContent.push({
        type: 'image_url',
        image_url: { url: `data:${cv_media_type};base64,${cv_base64}` }
      })
    } else if (cv_text) {
      userContent.push({ type: 'text', text: `CV du candidat:\n${cv_text}` })
    }

    if (cover_letter_text) {
      userContent.push({ type: 'text', text: `\nLettre de motivation:\n${cover_letter_text}` })
    }

    userContent.push({ type: 'text', text: prompt })

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 3000,
        messages: [{ role: 'user', content: userContent }]
      })
    })

    const data = await response.json()
    const content = data.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
