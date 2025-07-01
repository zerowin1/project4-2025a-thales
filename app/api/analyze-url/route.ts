import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"
import * as cheerio from "cheerio"

// 📖 NOVA FUNÇÃO: Extração "Modo Leitor"
function extractStructuredText($: cheerio.CheerioAPI): string {
  // Remover elementos desnecessários primeiro
  $(`
    script, style, noscript, iframe, nav, footer, header, aside, form,
    .advertisement, .ads, .ad, .social-share, .comments, .sidebar,
    .navigation, .menu, .cookie, .gdpr, .newsletter, .popup, .modal,
    [class*="ad-"], [class*="ads-"], [id*="ad-"], [id*="ads-"],
    [class*="social"], [class*="share"], [class*="follow"]
  `).remove()

  const mainSelectors = [
    "article",
    "main",
    "[role='main']",
    ".post-content",
    ".entry-content",
    ".article-content",
    "#content",
    "#main-content",
    ".article-body",
    ".content",
    ".description",
  ]

  let mainElement: cheerio.Cheerio<cheerio.Element> | null = null

  for (const selector of mainSelectors) {
    const element = $(selector).first()
    if (element.length > 0) {
      mainElement = element
      console.log(`📖 Container principal encontrado: "${selector}"`)
      break
    }
  }

  // Se nenhum seletor principal for encontrado, use o body como último recurso
  if (!mainElement) {
    mainElement = $("body")
    console.log("⚠️ Usando 'body' como fallback")
  }

  const textParts: string[] = []

  // Itera sobre os elementos de texto mais comuns para manter a estrutura
  mainElement.find("h1, h2, h3, h4, p, li, pre, blockquote, .description, .summary").each((i, el) => {
    const text = $(el).text().trim()
    if (text.length > 15) {
      // Reduzido de 20 para 15
      textParts.push(text)
    }
  })

  // Se não encontrou muito conteúdo, tenta parágrafos gerais
  if (textParts.length < 3) {
    $("p").each((i, el) => {
      const text = $(el).text().trim()
      if (text.length > 15) {
        textParts.push(text)
      }
    })
  }

  // Junta as partes com quebras de linha duplas para separar parágrafos
  const structuredText = textParts.join("\n\n")
  console.log(`📖 Extraído ${textParts.length} blocos de texto, ${structuredText.length} caracteres`)

  return structuredText
}

// 🎯 NOVA FUNÇÃO: Sistema de tags inteligente
function selectSmartTags(
  labels: string[],
  scores: number[],
): Array<{ tag: string; confidence: number; source: string }> {
  const results = []

  // Mapear e normalizar todas as tags com suas pontuações
  const tagCandidates = []
  for (let i = 0; i < labels.length; i++) {
    const normalizedTag = normalizeTag(labels[i])
    if (normalizedTag) {
      tagCandidates.push({
        tag: normalizedTag,
        confidence: scores[i],
        originalLabel: labels[i],
      })
    }
  }

  // Ordenar por confiança
  tagCandidates.sort((a, b) => b.confidence - a.confidence)

  console.log("🎯 SISTEMA DE TAGS INTELIGENTE:")

  // REGRA 1: Se tem 3+ tags com 20%+, usar só essas
  const highConfidenceTags = tagCandidates.filter((t) => t.confidence >= 0.2)
  if (highConfidenceTags.length >= 3) {
    console.log(`✅ Encontradas ${highConfidenceTags.length} tags com 20%+, usando as 3 melhores`)
    return highConfidenceTags.slice(0, 3).map((t) => ({
      tag: t.tag,
      confidence: Math.round(t.confidence * 100),
      source: "ai-high",
    }))
  }

  // REGRA 2: Se tem algumas com 15%+, usar essas + completar até 3
  const mediumConfidenceTags = tagCandidates.filter((t) => t.confidence >= 0.15)
  if (mediumConfidenceTags.length > 0) {
    console.log(`✅ Encontradas ${mediumConfidenceTags.length} tags com 15%+, completando até 3`)

    // Adicionar as de 15%+
    mediumConfidenceTags.forEach((t) => {
      results.push({
        tag: t.tag,
        confidence: Math.round(t.confidence * 100),
        source: "ai-medium",
      })
    })

    // Completar até 3 com as melhores restantes
    const remaining = tagCandidates.filter((t) => t.confidence < 0.15).slice(0, 3 - results.length)
    remaining.forEach((t) => {
      results.push({
        tag: t.tag,
        confidence: Math.round(t.confidence * 100),
        source: "ai-low",
      })
    })

    return results.slice(0, 3)
  }

  // REGRA 3: Se nenhuma tem 15%+, pegar as 3 melhores com porcentagem
  console.log("⚠️ Nenhuma tag com 15%+, usando as 3 melhores disponíveis")
  return tagCandidates.slice(0, 3).map((t) => ({
    tag: t.tag,
    confidence: Math.round(t.confidence * 100),
    source: "ai-best",
  }))
}

// 🚀 ESTRATÉGIA MELHORADA: Com sistema inteligente de tags
async function generateWithImprovedAI(content: string, title: string, domain: string, apiKey: string) {
  console.log("🤖 USANDO ESTRATÉGIA MELHORADA...")

  const results = {
    description: "",
    tags: [],
    success: false,
    error: null,
    method: "none",
  }

  try {
    // 📝 TENTATIVA 1: BART para descrição
    console.log("📝 Tentando BART-CNN para descrição...")
    try {
      const descResponse = await axios.post(
        "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
        {
          inputs: `Summarize in one sentence: ${content.substring(0, 1000)}`,
          parameters: {
            max_length: 50,
            min_length: 10,
            do_sample: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        },
      )

      if (descResponse.data?.[0]?.summary_text) {
        results.description = descResponse.data[0].summary_text.trim()
        console.log("✅ DESCRIÇÃO BART:", results.description)
      }
    } catch (error) {
      console.log("⚠️ BART falhou, tentando modelo menor...")

      try {
        const fallbackDesc = await axios.post(
          "https://api-inference.huggingface.co/models/google/flan-t5-small",
          {
            inputs: `Summarize: ${content.substring(0, 800)}`,
            parameters: {
              max_length: 40,
              temperature: 0.3,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          },
        )

        if (fallbackDesc.data?.[0]?.generated_text) {
          results.description = fallbackDesc.data[0].generated_text.trim()
          console.log("✅ DESCRIÇÃO FLAN-T5:", results.description)
        }
      } catch (fallbackError) {
        console.log("❌ Ambos modelos de descrição falharam")
      }
    }

    // 🏷️ TENTATIVA 2: MNLI para tags com sistema inteligente
    console.log("🏷️ Tentando BART-MNLI para tags...")
    try {
      const candidateLabels = [
        // Gaming
        "gaming",
        "video games",
        "game mod",
        "steam workshop",
        "indie games",

        // Tecnologia
        "software",
        "programming",
        "web development",
        "tools",
        "tutorial",
        "documentation",

        // Conteúdo
        "entertainment",
        "creative",
        "art",
        "music",
        "video",

        // Educação
        "education",
        "learning",
        "guide",
        "mathematics",

        // Produtividade
        "productivity",
        "business",
        "office",

        // Outros
        "community",
        "social",
        "news",
        "blog",
        "review",
      ]

      const tagsResponse = await axios.post(
        "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
        {
          inputs: content.substring(0, 1200), // Aumentado de 800 para 1200
          parameters: {
            candidate_labels: candidateLabels,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        },
      )

      if (tagsResponse.data?.labels && tagsResponse.data?.scores) {
        const labels = tagsResponse.data.labels
        const scores = tagsResponse.data.scores

        console.log("🎯 CLASSIFICAÇÃO RECEBIDA:")
        labels.slice(0, 10).forEach((label, index) => {
          const percentage = (scores[index] * 100).toFixed(1)
          console.log(`  ${label}: ${percentage}%`)
        })

        // Usar sistema inteligente de seleção
        const smartTags = selectSmartTags(labels, scores)
        results.tags = smartTags
        console.log("✅ TAGS SELECIONADAS:", smartTags)
        results.method = "mnli"
      }
    } catch (error) {
      console.log("⚠️ MNLI falhou, usando análise direta...")
      results.tags = analyzeContentDirectly(content, title, domain).map((tag) => ({
        tag,
        confidence: 0,
        source: "backup",
      }))
      results.method = "direct"
    }

    results.success = true
    return results
  } catch (error: any) {
    console.error("❌ ERRO GERAL NA IA:", error.message)
    results.error = error.message
    return results
  }
}

// Análise direta melhorada como fallback
function analyzeContentDirectly(content: string, title: string, domain: string): string[] {
  const tags = []
  const fullText = (title + " " + content).toLowerCase()

  // Regras específicas por domínio (EXPANDIDAS)
  const domainRules = {
    "steamcommunity.com": ["games", "steam", "gaming"],
    "github.com": ["codigo", "open-source", "programacao"],
    "youtube.com": ["video", "entretenimento"],
    "medium.com": ["artigo", "blog"],
    "stackoverflow.com": ["programacao", "q-a"],
    "reddit.com": ["forum", "comunidade"],
    "gsmarena.com": ["smartphone", "review", "tecnologia"],
    "krea.ai": ["inteligencia-artificial", "criativo"],
    "docs.google.com": ["documentos", "produtividade", "google"],
    "drive.google.com": ["armazenamento", "google", "produtividade"],
    "sheets.google.com": ["planilhas", "google", "produtividade"],
    calculator: ["calculadora", "matematica", "ferramentas"],
    "integral-calculator": ["matematica", "calculo", "educacao"],
    wolframalpha: ["matematica", "ciencia", "educacao"],
    "notion.so": ["produtividade", "organizacao", "notas"],
    "figma.com": ["design", "ui-ux", "criativo"],
    "canva.com": ["design", "criativo", "ferramentas"],
  }

  // Aplicar regras de domínio
  Object.entries(domainRules).forEach(([domainPattern, domainTags]) => {
    if (domain.includes(domainPattern.replace(".com", ""))) {
      tags.push(...domainTags)
      console.log(`🌐 Tags do domínio ${domainPattern}:`, domainTags)
    }
  })

  // Detecção por palavras-chave (EXPANDIDAS)
  const keywordRules = {
    "game|gaming|mod|workshop|steam|rimworld|medieval": ["games", "gaming"],
    "video|youtube|watch|meditation|ambience": ["video", "entretenimento"],
    "rpg|maker|decrypt|tool": ["games", "ferramentas"],
    "ai|artificial|intelligence|machine|learning": ["inteligencia-artificial"],
    "phone|smartphone|mobile|android|ios": ["smartphone", "mobile"],
    "tutorial|guide|how|learn": ["tutorial", "educacao"],
    "review|analysis|test": ["review", "analise"],
    "music|audio|sound|meditation": ["musica", "audio"],
    "programming|code|developer|api": ["programacao", "desenvolvimento"],
    "docs|document|google docs|sign.in": ["documentos", "produtividade"],
    "calculator|integral|math|calculus|derivative": ["matematica", "calculadora"],
    "step.by.step|solution|solve": ["tutorial", "educacao"],
    "online tool|free tool|web tool": ["ferramentas", "web"],
    "productivity|organize|workspace": ["produtividade", "organizacao"],
    "design|creative|art|draw": ["design", "criativo"],
  }

  Object.entries(keywordRules).forEach(([pattern, keywordTags]) => {
    if (new RegExp(pattern, "i").test(fullText)) {
      keywordTags.forEach((tag) => {
        if (!tags.includes(tag)) {
          tags.push(tag)
          console.log(`🔍 Tag detectada: "${pattern}" → "${tag}"`)
        }
      })
    }
  })

  return [...new Set(tags)].slice(0, 3) // Remove duplicatas
}

// Mapeamento melhorado de tags
function normalizeTag(englishTag: string): string | null {
  const tagMap = {
    gaming: "games",
    "video games": "games",
    "game mod": "mod",
    "steam workshop": "steam",
    "indie games": "indie",
    software: "software",
    programming: "programacao",
    "web development": "web-development",
    tools: "ferramentas",
    tutorial: "tutorial",
    entertainment: "entretenimento",
    creative: "criativo",
    art: "arte",
    music: "musica",
    video: "video",
    education: "educacao",
    learning: "aprendizado",
    guide: "guia",
    documentation: "documentacao",
    community: "comunidade",
    social: "social",
    news: "noticias",
    blog: "blog",
    review: "review",
    mathematics: "matematica",
    productivity: "produtividade",
    business: "negocios",
    office: "escritorio",
  }

  return tagMap[englishTag.toLowerCase()] || null
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    console.log("🔍 INICIANDO ANÁLISE MELHORADA:", url)

    let validUrl: URL
    try {
      validUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: "URL inválida" }, { status: 400 })
    }

    // Fetch com headers melhorados
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,pt;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
      },
      timeout: 12000,
      maxRedirects: 3,
    })

    console.log("📄 Página carregada - Status:", response.status)

    const $ = cheerio.load(response.data)

    // Extrair título melhorado
    let title = ""
    const titleSelectors = [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'meta[name="title"]',
      "title",
      "h1",
      ".title",
      ".post-title",
      ".article-title",
    ]

    for (const selector of titleSelectors) {
      const element = $(selector).first()
      if (selector.startsWith("meta")) {
        title = element.attr("content") || ""
      } else {
        title = element.text().trim()
      }
      if (title && title.length > 3) {
        console.log(`📝 Título: ${title.substring(0, 80)}`)
        break
      }
    }

    if (!title) {
      title = validUrl.hostname.replace("www.", "")
    }
    title = title.substring(0, 120).trim()

    // Extrair descrição melhorada
    let webDescription = ""
    const descSelectors = [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      ".description",
      ".excerpt",
      ".summary",
    ]

    for (const selector of descSelectors) {
      const element = $(selector).first()
      if (selector.startsWith("meta")) {
        webDescription = element.attr("content") || ""
      } else {
        webDescription = element.text().trim()
      }
      if (webDescription && webDescription.length > 10) {
        console.log(`📄 Descrição web: ${webDescription.substring(0, 100)}`)
        break
      }
    }

    // 📖 USAR NOVA EXTRAÇÃO ESTRUTURADA
    const structuredContent = extractStructuredText($)
    const cleanTextForAI = `Title: ${title}. Description: ${webDescription}. Content: ${structuredContent}`.substring(
      0,
      2500,
    ) // Aumentado de 1000 para 2500

    console.log("🧹 Conteúdo estruturado para IA:", cleanTextForAI.substring(0, 200))

    // Variáveis finais
    const finalTitle = title
    let finalDescription = webDescription
    let aiTags = []
    let backupTags = []
    let aiSuccess = false
    let aiMethod = "none"

    // 🤖 CHAMAR IA MELHORADA
    if (process.env.HUGGINGFACE_API_KEY) {
      console.log("🚀 CHAMANDO IA MELHORADA...")
      const aiResult = await generateWithImprovedAI(
        cleanTextForAI,
        title,
        validUrl.hostname,
        process.env.HUGGINGFACE_API_KEY,
      )

      if (aiResult.success) {
        aiSuccess = true
        aiMethod = aiResult.method

        // Usar descrição da IA se for melhor
        if (aiResult.description && aiResult.description.length > 15) {
          finalDescription = aiResult.description
          console.log("✅ USANDO DESCRIÇÃO DA IA")
        }

        aiTags = aiResult.tags || []
        console.log("✅ TAGS DA IA:", aiTags)
      } else {
        console.log("❌ IA FALHOU:", aiResult.error)
      }
    }

    // Tags de backup sempre (melhoradas)
    const backupTagsSimple = analyzeContentDirectly(cleanTextForAI, title, validUrl.hostname)
    backupTags = backupTagsSimple.map((tag) => ({
      tag,
      confidence: 0,
      source: "backup",
    }))
    console.log("🔄 Tags de backup:", backupTags)

    // Combinar tags inteligentemente
    const allTagsWithMeta = [...aiTags, ...backupTags]
    const uniqueTags = []
    const seenTags = new Set()

    for (const tagObj of allTagsWithMeta) {
      if (!seenTags.has(tagObj.tag)) {
        seenTags.add(tagObj.tag)
        uniqueTags.push(tagObj)
      }
    }

    const finalTags = uniqueTags.slice(0, 5)

    // Garantir descrição mínima
    if (!finalDescription || finalDescription.length < 10) {
      finalDescription = `Recurso de ${validUrl.hostname.replace("www.", "")}`
    }

    const result = {
      title: finalTitle,
      description: finalDescription,
      tags: finalTags.map((t) => t.tag).join(", "),
      aiGenerated: {
        description: aiSuccess && finalDescription !== webDescription,
        tags: aiTags,
        backupTags: backupTags,
        success: aiSuccess,
        method: aiMethod,
        tagsWithConfidence: finalTags, // NOVO: Tags com metadados
      },
      debug: {
        domain: validUrl.hostname,
        aiUsed: aiSuccess,
        aiMethod: aiMethod,
        aiTagsCount: aiTags.length,
        backupTagsCount: backupTags.length,
        totalTags: finalTags.length,
        contentLength: cleanTextForAI.length,
        structuredBlocks: structuredContent.split("\n\n").length,
      },
    }

    console.log("🎉 RESULTADO FINAL MELHORADO:")
    console.log("=".repeat(50))
    console.log(JSON.stringify(result, null, 2))
    console.log("=".repeat(50))

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("💥 ERRO GERAL:", error.message)
    return NextResponse.json(
      {
        error: "Erro na análise",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
