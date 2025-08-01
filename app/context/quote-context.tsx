"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface QuoteItem {
  id: string
  name: string
  image?: string
  brand?: string
  packSize?: string
  casNumber?: string
  quantity: number
}

interface QuoteContextType {
  quoteItems: QuoteItem[]
  addItemToQuote: (item: QuoteItem) => void
  removeItemFromQuote: (id: string) => void
  clearQuote: () => void
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined)

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])

  const addItemToQuote = (item: QuoteItem) => {
    setQuoteItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id)
      if (existingItem) {
        return prevItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i))
      }
      return [...prevItems, { ...item, quantity: item.quantity || 1 }]
    })
  }

  const removeItemFromQuote = (id: string) => {
    setQuoteItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const clearQuote = () => {
    setQuoteItems([])
  }

  return (
    <QuoteContext.Provider value={{ quoteItems, addItemToQuote, removeItemFromQuote, clearQuote }}>
      {children}
    </QuoteContext.Provider>
  )
}

export function useQuote() {
  const context = useContext(QuoteContext)
  if (context === undefined) {
    throw new Error("useQuote must be used within a QuoteProvider")
  }
  return context
}
