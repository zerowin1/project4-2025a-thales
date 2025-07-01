import { NextResponse } from "next/server"
import axios from "axios"

const TEST_MODELS = [
  {
    name: "google/flan-t5-small",
    description: "Google FLAN-T5 Small - Rápido e eficiente",
    priority: 1,
  },
  {
    name: "google/flan-t5-base",
    description: "Google FLAN-T5 Base - Modelo original",
    priority: 2,
  },
  {
    name: "microsoft/DialoGPT-medium",
    description: "Microsoft DialoGPT - Conversação",
    priority: 3,
  },
  {
    name: "facebook/bart-large-cnn",
    description: "Facebook BART - Sumarização",
    priority: 4,
  },
  {
    name: "distilbert-base-uncased",
    description: "DistilBERT - Classificação de texto",
    priority: 5,
  },
  {
    name: "gpt2",
    description: "GPT-2 - Geração de texto clássica",
    priority: 6,
  },
]

export async function POST() {
  if (!process.env.HUGGINGFACE_API_KEY) {
    return NextResponse.json({
      error: "Chave da API não encontrada",
      solution: "Adicione HUGGINGFACE_API_KEY no arquivo .env",
    })
  }

  const results = []
  const testPrompt = "Generate 5 tags for a JavaScript tutorial website about React hooks"

  console.log("🧪 TESTANDO MODELOS DISPONÍVEIS...")
  console.log("🔑 Chave API:", process.env.HUGGINGFACE_API_KEY.substring(0, 8) + "...")

  for (const model of TEST_MODELS) {
    const startTime = Date.now()

    try {
      console.log(`🤖 Testando: ${model.name}`)

      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model.name}`,
        {
          inputs: testPrompt,
          parameters: {
            max_length: 50,
            temperature: 0.3,
            do_sample: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 45000, // 45 segundos
        },
      )

      const responseTime = Date.now() - startTime

      results.push({
        model: model.name,
        description: model.description,
        priority: model.priority,
        status: "✅ FUNCIONANDO",
        response: response.data[0]?.generated_text || response.data?.generated_text || "Resposta recebida",
        statusCode: response.status,
        responseTime,
      })

      console.log(`✅ ${model.name} - FUNCIONANDO (${responseTime}ms)`)

      // Se encontrou um modelo que funciona, pode parar aqui para economizar tempo
      // Mas vamos testar todos para ter o panorama completo
    } catch (error: any) {
      const responseTime = Date.now() - startTime

      results.push({
        model: model.name,
        description: model.description,
        priority: model.priority,
        status: "❌ ERRO",
        error: error.response?.status || error.message,
        details: error.response?.data || error.message,
        responseTime,
      })

      console.log(`❌ ${model.name} - ERRO:`, error.response?.status, error.message)

      // Log específico para diferentes tipos de erro
      if (error.response?.status === 404) {
        console.log(`   → Modelo não encontrado ou indisponível`)
      } else if (error.response?.status === 403) {
        console.log(`   → Problema de permissão na chave API`)
      } else if (error.response?.status === 503) {
        console.log(`   → Modelo sobrecarregado, tente mais tarde`)
      }
    }
  }

  // Ordenar por prioridade e status
  results.sort((a, b) => {
    if (a.status.includes("FUNCIONANDO") && !b.status.includes("FUNCIONANDO")) return -1
    if (!a.status.includes("FUNCIONANDO") && b.status.includes("FUNCIONANDO")) return 1
    return a.priority - b.priority
  })

  const workingModels = results.filter((r) => r.status.includes("FUNCIONANDO"))
  const recommendation = workingModels.length > 0 ? workingModels[0].model : "Nenhum modelo funcionando"

  console.log("📊 RESUMO DOS TESTES:")
  console.log(`   Total testado: ${TEST_MODELS.length}`)
  console.log(`   Funcionando: ${workingModels.length}`)
  console.log(`   Recomendado: ${recommendation}`)

  return NextResponse.json({
    totalTested: TEST_MODELS.length,
    working: workingModels.length,
    results,
    recommendation,
    keyInfo: {
      found: true,
      preview: process.env.HUGGINGFACE_API_KEY.substring(0, 8) + "...",
      length: process.env.HUGGINGFACE_API_KEY.length,
    },
    summary: {
      working: workingModels.map((m) => m.model),
      failing: results
        .filter((r) => !r.status.includes("FUNCIONANDO"))
        .map((m) => ({
          model: m.model,
          error: m.error,
        })),
    },
  })
}
