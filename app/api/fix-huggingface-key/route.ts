import { NextResponse } from "next/server"
import axios from "axios"

export async function POST() {
  try {
    console.log("🔧 DIAGNÓSTICO COMPLETO DA CHAVE HUGGING FACE")

    if (!process.env.HUGGINGFACE_API_KEY) {
      return NextResponse.json({
        error: "Chave não encontrada",
        solution: "Adicione HUGGINGFACE_API_KEY=hf_... no arquivo .env",
      })
    }

    const key = process.env.HUGGINGFACE_API_KEY
    console.log("🔑 Chave encontrada:", key.substring(0, 8) + "...")
    console.log("📏 Tamanho:", key.length, "caracteres")
    console.log("🏁 Começa com 'hf_':", key.startsWith("hf_"))

    // Testar diferentes endpoints para diagnosticar o problema
    const tests = [
      {
        name: "Teste 1: Modelo google/flan-t5-base",
        url: "https://api-inference.huggingface.co/models/google/flan-t5-base",
        payload: { inputs: "Hello world" },
      },
      {
        name: "Teste 2: Modelo alternativo microsoft/DialoGPT-medium",
        url: "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
        payload: { inputs: "Hello" },
      },
      {
        name: "Teste 3: Verificar informações da conta",
        url: "https://huggingface.co/api/whoami-v2",
        payload: null,
      },
    ]

    const results = []

    for (const test of tests) {
      try {
        console.log(`🧪 ${test.name}...`)

        const config: any = {
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }

        let response
        if (test.payload) {
          response = await axios.post(test.url, test.payload, config)
        } else {
          response = await axios.get(test.url, config)
        }

        results.push({
          test: test.name,
          status: "✅ SUCESSO",
          statusCode: response.status,
          data: response.data,
        })

        console.log(`✅ ${test.name} - SUCESSO`)
      } catch (error: any) {
        const errorInfo = {
          test: test.name,
          status: "❌ ERRO",
          statusCode: error.response?.status || "N/A",
          error: error.message,
          details: error.response?.data || "Sem detalhes",
        }

        results.push(errorInfo)
        console.log(`❌ ${test.name} - ERRO:`, error.response?.status, error.message)

        // Análise específica do erro 403
        if (error.response?.status === 403) {
          console.log("🔍 ANÁLISE DO ERRO 403:")
          console.log("   - Chave pode estar expirada")
          console.log("   - Chave pode não ter permissões corretas")
          console.log("   - Conta pode estar suspensa")
          console.log("   - Modelo pode estar restrito")
        }
      }
    }

    return NextResponse.json({
      keyInfo: {
        found: true,
        length: key.length,
        preview: key.substring(0, 8) + "...",
        startsWithHf: key.startsWith("hf_"),
      },
      tests: results,
      recommendations: [
        "Se todos os testes falharam com 403: Gere uma nova chave",
        "Se apenas alguns falharam: Alguns modelos podem estar restritos",
        "Se o teste 3 passou: Sua chave está válida, problema é com modelos específicos",
        "Acesse: https://huggingface.co/settings/tokens para gerenciar chaves",
      ],
    })
  } catch (error: any) {
    return NextResponse.json({
      error: "Erro no diagnóstico",
      details: error.message,
    })
  }
}
