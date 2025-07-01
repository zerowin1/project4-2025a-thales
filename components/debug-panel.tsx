"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Bug, Sparkles, Key, AlertTriangle } from "lucide-react"

export function DebugPanel() {
  const [url, setUrl] = useState("https://github.com/vercel/next.js")
  const [prompt, setPrompt] = useState("Generate 5 tags for a JavaScript tutorial about React hooks")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isTestingAI, setIsTestingAI] = useState(false)
  const [isCheckingEnv, setIsCheckingEnv] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [aiResult, setAiResult] = useState<any>(null)
  const [envResult, setEnvResult] = useState<any>(null)

  const checkEnvironment = async () => {
    setIsCheckingEnv(true)
    try {
      const response = await fetch("/api/check-env")
      const data = await response.json()
      setEnvResult(data)
    } catch (error) {
      console.error("Erro ao verificar ambiente:", error)
    } finally {
      setIsCheckingEnv(false)
    }
  }

  const testUrl = async () => {
    if (!url) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const testAI = async () => {
    if (!prompt) return

    setIsTestingAI(true)
    try {
      const response = await fetch("/api/debug-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      const data = await response.json()
      setAiResult(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsTestingAI(false)
    }
  }

  useEffect(() => {
    checkEnvironment()
  }, [])

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Verificação do Ambiente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Verificação do Ambiente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={checkEnvironment} disabled={isCheckingEnv}>
            {isCheckingEnv ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Verificar Variáveis de Ambiente
          </Button>

          {envResult && (
            <div className="space-y-3">
              <Alert variant={envResult.hasHuggingFaceKey ? "default" : "destructive"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Status da Chave Hugging Face:</strong>{" "}
                  {envResult.hasHuggingFaceKey ? "✅ Encontrada" : "❌ Não encontrada"}
                </AlertDescription>
              </Alert>

              {envResult.hasHuggingFaceKey && (
                <div className="bg-green-50 p-3 rounded">
                  <p>
                    <strong>Comprimento da chave:</strong> {envResult.keyLength} caracteres
                  </p>
                  <p>
                    <strong>Preview:</strong> {envResult.keyPreview}
                  </p>
                </div>
              )}

              {!envResult.hasHuggingFaceKey && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <strong>Problema:</strong> A variável HUGGINGFACE_API_KEY não foi encontrada.
                    <br />
                    <strong>Solução:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Verifique se o arquivo .env existe na raiz do projeto</li>
                      <li>Verifique se a linha está assim: HUGGINGFACE_API_KEY=hf_xxxxxxxxx</li>
                      <li>Reinicie o servidor (npm run dev)</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-gray-100 p-3 rounded text-sm">
                <strong>Variáveis relacionadas encontradas:</strong>
                <pre>{JSON.stringify(envResult.allEnvKeys, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teste de URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Debug - Análise de URL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">URL para testar:</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://exemplo.com"
              className="w-full p-2 border rounded"
            />
            <p className="text-xs text-gray-500 mt-1">Sugestões: GitHub, Stack Overflow, Medium, YouTube</p>
          </div>
          <Button onClick={testUrl} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Analisar URL (Veja o console para logs detalhados)
          </Button>

          {result && (
            <div className="space-y-4 mt-4">
              <h3 className="font-semibold">Resultado:</h3>
              <div className="grid gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <strong>Título:</strong> {result.title}
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <strong>Descrição:</strong> {result.description}
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <strong>Tags:</strong>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {result.tags.split(", ").map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                {result.debug && (
                  <div className="bg-gray-100 p-3 rounded text-sm">
                    <strong>Debug Info:</strong>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(result.debug, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teste Direto da IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Debug - Teste Direto da IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Prompt para IA:</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Digite seu prompt aqui..."
              rows={4}
            />
          </div>
          <Button onClick={testAI} disabled={isTestingAI}>
            {isTestingAI ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Testar IA Diretamente
          </Button>

          {aiResult && (
            <div className="space-y-4 mt-4">
              <h3 className="font-semibold">Resultado da IA:</h3>
              <div className="bg-gray-100 p-3 rounded text-sm">
                <div className="mb-3 bg-blue-100 p-2 rounded">
                  <strong>Prompt enviado:</strong>
                  <pre className="mt-1 whitespace-pre-wrap text-xs">{aiResult.prompt}</pre>
                </div>
                <div className="mb-3 bg-green-100 p-2 rounded">
                  <strong>Texto gerado:</strong>
                  <pre className="mt-1 whitespace-pre-wrap font-medium">{aiResult.generated_text}</pre>
                </div>
                <div className="bg-gray-200 p-2 rounded">
                  <strong>Resposta completa da API:</strong>
                  <pre className="mt-1 text-xs">{JSON.stringify(aiResult.response, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Como usar este debug:</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <strong>Primeiro:</strong> Verifique se a chave da API está configurada
            </li>
            <li>
              <strong>Segundo:</strong> Teste uma URL e veja os logs no console do navegador
            </li>
            <li>
              <strong>Terceiro:</strong> Teste a IA diretamente para ver se ela responde
            </li>
            <li>
              <strong>Quarto:</strong> Compare os resultados para identificar problemas
            </li>
          </ol>

          <Alert className="mt-4">
            <AlertDescription>
              <strong>💡 Dica:</strong> Abra o console do navegador (F12) para ver todos os logs detalhados durante a
              análise da URL. Lá você verá exatamente o que está sendo extraído e enviado para a IA.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
