import { Suspense } from "react"
import HeaderClient from "./header-client"

export function Header() {
  return (
    <Suspense
      fallback={
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">Chemical Corporation</div>
              <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            </div>
          </div>
        </header>
      }
    >
      <HeaderClient />
    </Suspense>
  )
}
