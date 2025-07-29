"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

type Product = {
  code: string
  name: string
  category: string
  pack_size: string
  price: string
}

type QuoteItem = Product & {
  quantity: number
}

interface QuoteContextType {
  items: QuoteItem[]
  addItem: (item: QuoteItem) => void
  removeItem: (code: string) => void
  updateQuantity: (code: string, quantity: number) => void
  clearQuote: () => void
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined)

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([])

  const addItem = (item: QuoteItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.code === item.code)
      if (existingItem) {
        return prevItems.map((i) => (i.code === item.code ? { ...i, quantity: i.quantity + item.quantity } : i))
      }
      return [...prevItems, item]
    })
  }

  const removeItem = (code: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.code !== code))
  }

  const updateQuantity = (code: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(code)
    } else {
      setItems((prevItems) => prevItems.map((item) => (item.code === code ? { ...item, quantity } : item)))
    }
  }

  const clearQuote = () => {
    setItems([])
  }

  return (
    <QuoteContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearQuote }}>
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
