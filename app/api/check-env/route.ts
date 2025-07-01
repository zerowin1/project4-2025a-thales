import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    hasHuggingFaceKey: !!process.env.HUGGINGFACE_API_KEY,
    keyLength: process.env.HUGGINGFACE_API_KEY?.length || 0,
    keyPreview: process.env.HUGGINGFACE_API_KEY
      ? `${process.env.HUGGINGFACE_API_KEY.substring(0, 8)}...`
      : "Não encontrada",
    allEnvKeys: Object.keys(process.env).filter((key) => key.includes("HUGGING") || key.includes("HF_")),
  })
}
