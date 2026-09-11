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
    const { text, url } = await req.json()
    let jobText = text || ''

    if (url && !jobText) {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
        }
      })
      if (!res.ok) {
        throw new Error(`Impossible d'accéder à l'URL (${res.status}). Copiez-collez le texte de l'offre directement.`)
      }
      const html = await res.text()
      jobText = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 8000)
      if (jobText.length < 200) {
        throw new Error('Contenu insuffisant récupéré depuis cette URL (site protégé ?). Copiez-collez le texte de l\'offre directement.')
      }
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    const model = Deno.env.get('AI_MODEL') || 'gpt-4o'

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Tu es un expert RH. Analyse cette offre d'emploi en intégralité et extrait TOUTES les informations sans rien omettre.

OFFRE À ANALYSER:
${jobText}

Réponds UNIQUEMENT avec un JSON valide (sans markdown, sans backticks) ayant exactement ces champs.
Pour chaque champ texte, sois exhaustif et fidèle au contenu original — ne résume pas, retranscris tout le contenu pertinent.

{
  "title": "titre exact du poste",
  "company": "nom exact de l'entreprise",
  "location": "lieu complet (ville, département, pays, remote/hybride si mentionné)",
  "contract_type": "CDI|CDD|Stage|Freelance|Alternance",
  "salary_range": "fourchette salariale exacte avec avantages si mentionnés (sinon chaîne vide)",
  "description": "description complète du poste et du contexte de l'entreprise, sans rien couper",
  "missions": "liste complète de TOUTES les missions et responsabilités, une par ligne avec tiret",
  "skills": "liste complète de TOUTES les compétences techniques et outils mentionnés, une par ligne avec tiret",
  "experience": "niveau et années d'expérience requis, avec le contexte exact mentionné",
  "education": "niveau d'études et formations requis, exacts",
  "languages": "toutes les langues requises ou souhaitées avec le niveau si précisé",
  "mandatory_criteria": "liste de tous les critères absolument requis (must-have), un par ligne avec tiret",
  "preferred_criteria": "liste de tous les critères appréciés mais non obligatoires (nice-to-have), un par ligne avec tiret",
  "full_offer": "reproduction complète et fidèle de l'offre en Markdown bien structuré avec # pour le titre, ## pour chaque section, et - pour les listes. Inclure TOUTES les sections sans exception."
}`
        }]
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
