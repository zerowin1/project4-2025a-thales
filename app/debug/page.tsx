import { DebugPanel } from "@/components/debug-panel"

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Debug Panel</h1>
        <DebugPanel />
      </div>
    </div>
  )
}
