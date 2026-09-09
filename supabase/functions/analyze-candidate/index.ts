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
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    const model = Deno.env.get('AI_MODEL') || 'claude-opus-5'

    const jobContext = job_offer ? `\n\nOffre d'emploi ciblée:\nPoste: ${job_offer.title}\nEntreprise: ${job_offer.company}\nDescription: ${job_offer.description || ''}\nCompétences requises: ${job_offer.skills || ''}\nExpérience: ${job_offer.experience || ''}` : ''

    const userContent: unknown[] = []

    if (cv_base64 && cv_media_type) {
      userContent.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: cv_media_type,
          data: cv_base64,
        }
      })
    } else if (cv_text) {
      userContent.push({
        type: 'text',
        text: `CV du candidat:\n${cv_text}`
      })
    }

    if (cover_letter_text) {
      userContent.push({
        type: 'text',
        text: `\nLettre de motivation:\n${cover_letter_text}`
      })
    }

    userContent.push({
      type: 'text',
      text: `${jobContext}

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
    })

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': apiKey!,
      'anthropic-version': '2023-06-01',
    }

    if (cv_base64 && cv_media_type === 'application/pdf') {
      headers['anthropic-beta'] = 'pdfs-2024-09-25'
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        max_tokens: 3000,
        messages: [{ role: 'user', content: userContent }]
      })
    })

    const data = await response.json()
    const content = data.content[0].text
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
