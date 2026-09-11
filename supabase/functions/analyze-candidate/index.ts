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

    const coverSuffix = cover_letter_text ? `\n\nLettre de motivation:\n${cover_letter_text}` : ''
    const fullPrompt = prompt + coverSuffix

    let aiContent: string

    if (cv_base64 && cv_media_type) {
      if (cv_media_type.startsWith('image/')) {
        // Images → Chat Completions vision
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            max_tokens: 3000,
            messages: [{
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: `data:${cv_media_type};base64,${cv_base64}` } },
                { type: 'text', text: fullPrompt }
              ]
            }]
          })
        })
        const data = await response.json()
        if (!data.choices?.[0]) throw new Error(data.error?.message || 'Erreur API OpenAI')
        aiContent = data.choices[0].message.content
      } else {
        // PDF, DOCX et autres binaires → Responses API (supporte les fichiers nativement)
        const ext = cv_media_type === 'application/pdf' ? 'pdf'
          : cv_media_type.includes('word') || cv_media_type.includes('docx') ? 'docx'
          : 'bin'
        const response = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            input: [{
              role: 'user',
              content: [
                {
                  type: 'input_file',
                  filename: `cv.${ext}`,
                  file_data: `data:${cv_media_type};base64,${cv_base64}`
                },
                { type: 'input_text', text: fullPrompt }
              ]
            }]
          })
        })
        const data = await response.json()
        if (!data.output?.[0]) throw new Error(data.error?.message || 'Erreur API OpenAI (Responses)')
        aiContent = data.output[0].content[0].text
      }
    } else if (cv_text) {
      // Texte brut → Chat Completions
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          max_tokens: 3000,
          messages: [{
            role: 'user',
            content: `CV du candidat:\n${cv_text}\n\n${fullPrompt}`
          }]
        })
      })
      const data = await response.json()
      if (!data.choices?.[0]) throw new Error(data.error?.message || 'Erreur API OpenAI')
      aiContent = data.choices[0].message.content
    } else {
      throw new Error('Aucun contenu CV fourni')
    }

    const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : aiContent)

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
