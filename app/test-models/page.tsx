"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Zap, Brain, MessageSquare } from "lucide-react"

interface ModelResult {
  model: string
  status: string
  response?: string
  error?: string
  details?: any
  statusCode?: number
  responseTime?: number
}

export default function TestModelsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<ModelResult[]>([])
  const [summary, setSummary] = useState<any>(null)

  const testModels = async () => {
    setIsLoading(true)
    setResults([])
    setSummary(null)

    try {
      const response = await fetch("/api/test-ai-models", {
        method: "POST",
      })

      const data = await response.json()
      setResults(data.results || [])
      setSummary({
        totalTested: data.totalTested,
        working: data.working,
        recommendation: data.recommendation,
      })
    } catch (error) {
      console.error("Erro ao testar modelos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getModelIcon = (modelName: string) => {
    if (modelName.includes("flan-t5")) return <Brain className="h-5 w-5 text-blue-500" />
    if (modelName.includes("DialoGPT")) return <MessageSquare className="h-5 w-5 text-green-500" />
    if (modelName.includes("bart")) return <Zap className="h-5 w-5 text-purple-500" />
    return <Brain className="h-5 w-5 text-gray-500" />
  }

  const getStatusColor = (status: string) => {
    if (status.includes("FUNCIONANDO")) return "bg-green-100 text-green-800 border-green-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Teste de Modelos IA
            </h1>
            <p className="text-gray-600 text-lg">
              Vamos testar quais modelos do Hugging Face estão funcionando com sua chave API
            </p>
          </div>

          {/* Test Button */}
          <div className="text-center mb-8">
            <Button
              onClick={testModels}
              disabled={isLoading}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Testando Modelos...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Testar Todos os Modelos
                </>
              )}
            </Button>
          </div>

          {/* Summary */}
          {summary && (
            <Alert className="mb-8">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <strong>Total Testado:</strong> {summary.totalTested} modelos
                  </div>
                  <div>
                    <strong>Funcionando:</strong>{" "}
                    <span className={summary.working > 0 ? "text-green-600" : "text-red-600"}>
                      {summary.working} modelo{summary.working !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div>
                    <strong>Recomendado:</strong>{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{summary.recommendation || "Nenhum"}</code>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Resultados dos Testes</h2>

              <div className="grid gap-4">
                {results.map((result, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getModelIcon(result.model)}
                          <div>
                            <CardTitle className="text-lg">{result.model}</CardTitle>
                            <p className="text-sm text-gray-500">
                              {result.model.includes("flan-t5") && "Google FLAN-T5 - Modelo de linguagem"}
                              {result.model.includes("DialoGPT") && "Microsoft DialoGPT - Conversação"}
                              {result.model.includes("bart") && "Facebook BART - Sumarização"}
                              {result.model.includes("distilbert") && "DistilBERT - Classificação"}
                              {result.model.includes("gpt2") && "GPT-2 - Geração de texto"}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status.includes("FUNCIONANDO") ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {result.status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {result.status.includes("FUNCIONANDO") ? (
                        <div className="space-y-3">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-green-800 mb-1">✅ Resposta Gerada:</p>
                            <p className="text-sm text-green-700 font-mono bg-white p-2 rounded border">
                              "{result.response}"
                            </p>
                          </div>
                          {result.statusCode && (
                            <div className="flex gap-4 text-xs text-gray-500">
                              <span>Status: {result.statusCode}</span>
                              {result.responseTime && <span>Tempo: {result.responseTime}ms</span>}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-red-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-red-800 mb-1">❌ Erro:</p>
                            <p className="text-sm text-red-700">{result.error}</p>
                          </div>
                          {result.details && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs font-medium text-gray-600 mb-1">Detalhes:</p>
                              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                {typeof result.details === "string"
                                  ? result.details
                                  : JSON.stringify(result.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>📋 Como Interpretar os Resultados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">✅ Se algum modelo funcionar:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Sua chave API está válida</li>
                    <li>• O sistema de IA vai funcionar</li>
                    <li>• Tags serão geradas automaticamente</li>
                    <li>• Use o modelo recomendado</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-600 mb-2">❌ Se nenhum funcionar:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Verifique sua chave API</li>
                    <li>• Tente gerar uma nova chave</li>
                    <li>• Sistema funcionará só com tags básicas</li>
                    <li>• Tags básicas são muito inteligentes</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>💡 Dica:</strong> Mesmo se nenhum modelo funcionar, o sistema de tags básicas foi muito
                  melhorado e gera tags excelentes baseadas no domínio, tecnologias detectadas e contexto da página.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
