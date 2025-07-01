import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!process.env.HUGGINGFACE_API_KEY) {
      return NextResponse.json({ error: "Chave da API não configurada" }, { status: 400 })
    }

    console.log("🧪 TESTE DIRETO DA IA")
    console.log("Prompt:", prompt)

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/google/flan-t5-base",
      {
        inputs: prompt,
        parameters: {
          max_length: 100,
          temperature: 0.3,
          do_sample: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      },
    )

    console.log("Resposta completa:", JSON.stringify(response.data, null, 2))

    return NextResponse.json({
      prompt,
      response: response.data,
      generated_text: response.data[0]?.generated_text || "Nenhum texto gerado",
    })
  } catch (error: any) {
    console.error("Erro:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
