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
      // Sites known to block server-side fetches (Cloudflare / JS rendering required)
      const blockedDomains = ['indeed.com', 'linkedin.com', 'glassdoor.com', 'monster.com', 'apec.fr', 'pole-emploi.fr', 'francetravail.fr']
      const parsedUrl = new URL(url)
      const hostname = parsedUrl.hostname.replace('www.', '')

      const isBlocked = blockedDomains.some(d => hostname.endsWith(d))
      if (isBlocked) {
        throw new Error(`${hostname} bloque les accès automatiques (protection anti-robots). Ouvrez l'offre dans votre navigateur, sélectionnez tout le texte (Ctrl+A puis Ctrl+C) et collez-le dans l'onglet "Coller le texte".`)
      }

      // Detect search result pages instead of a single job offer
      const searchPatterns = ['/jobs?', '/recherche?', '/offres?', '/search?', '/emploi?', '?q=', '?search=', '?query=', '&vjk=']
      const isSearchPage = searchPatterns.some(p => url.includes(p)) && !url.includes('/job/') && !url.includes('/offre/') && !url.includes('/view/')
      if (isSearchPage) {
        throw new Error("L'URL pointe vers une liste de résultats, pas vers une offre précise. Ouvrez la fiche d'une offre spécifique, copiez l'URL de cette page et réessayez — ou collez directement le texte de l'offre.")
      }

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
        throw new Error(`Impossible d'accéder à cette URL (erreur ${res.status}). Le site bloque peut-être les accès automatiques. Copiez-collez le texte de l'offre directement.`)
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
        throw new Error('Le contenu récupéré est insuffisant — ce site utilise probablement JavaScript pour afficher l\'offre. Copiez-collez le texte de l\'offre directement.')
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

Réponds UNIQUEMENT avec un objet JSON valide (aucun markdown autour, aucun backtick, juste le JSON brut).
Sois exhaustif et fidèle au contenu original — ne résume pas, retranscris tout le contenu pertinent.
Pour les champs à valeur fixe, choisis OBLIGATOIREMENT parmi les valeurs listées.

{
  "title": "titre exact du poste",
  "company": "nom exact de l'entreprise",
  "sector": "secteur d'activité de l'entreprise (ex: Technologie, Finance, Santé, Industrie…)",
  "location": "ville et pays complets",
  "remote_policy": "EXACTEMENT l'une de ces valeurs : Présentiel | Hybride | Full Remote",
  "contract_type": "EXACTEMENT l'une de ces valeurs : CDI | CDD | Stage | Alternance | Freelance",
  "work_schedule": "EXACTEMENT l'une de ces valeurs : Temps plein | Temps partiel | Autre",
  "salary_range": "rémunération exacte avec tous les détails (fourchette, fixe+variable, avantages financiers) — chaîne vide si non mentionné",
  "start_date": "date ou délai de prise de poste (ex: Immédiat, Dès que possible, Janvier 2026) — chaîne vide si non mentionné",
  "description": "description complète du poste ET du contexte/présentation de l'entreprise, sans rien couper",
  "missions": "liste complète de TOUTES les missions et responsabilités, une par ligne avec tiret (- mission)",
  "skills": "liste complète de TOUTES les compétences techniques, outils, frameworks, logiciels mentionnés, une par ligne avec tiret",
  "experience": "niveau et années d'expérience requis avec le contexte exact de l'offre",
  "education": "niveau d'études, diplômes et formations requis ou souhaités, exacts",
  "languages": "toutes les langues requises ou souhaitées avec le niveau si précisé",
  "benefits": "liste complète de TOUS les avantages : RTT, tickets restaurant, mutuelle, télétravail, primes, CE, véhicule, formations, etc. — une par ligne avec tiret",
  "team_size": "taille de l'équipe, contexte d'équipe, hiérarchie, environnement de travail si mentionnés",
  "mandatory_criteria": "liste de tous les critères absolument requis (must-have), un par ligne avec tiret",
  "preferred_criteria": "liste de tous les critères appréciés mais non obligatoires (nice-to-have), un par ligne avec tiret",
  "recruitment_process": "étapes du processus de recrutement si mentionnées (entretiens, tests, délais…)",
  "full_offer": "reproduction complète et fidèle de TOUTE l'offre en Markdown structuré : # Titre, **méta en gras**, puis ## pour chaque section (Description, Missions, Compétences, Profil recherché, Avantages, Processus…), et - pour chaque item de liste. N'omets AUCUNE information présente dans l'offre originale."
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
