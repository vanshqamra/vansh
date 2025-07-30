import { Suspense } from "react"
import HeaderClient from "./header-client"

export function Header() {
  return (
    <Suspense
      fallback={
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-32 bg-slate-200 rounded animate-pulse"></div>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>
      }
    >
      <HeaderClient />
    </Suspense>
  )
}
