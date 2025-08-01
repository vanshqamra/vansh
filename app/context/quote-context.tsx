"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface QuoteItem {
  id: string
  name: string
  brand: string
  price: string
  quantity: number
  packSize?: string
  material?: string
  code: string
}

interface QuoteContextType {
  items: QuoteItem[]
  addItem: (item: Omit<QuoteItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearQuote: () => void
  totalItems: number
  isLoaded: boolean
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined)

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedQuote = localStorage.getItem("quote-items")
        if (savedQuote) {
          setItems(JSON.parse(savedQuote))
        }
      } catch (error) {
        console.error("Error loading quote from localStorage:", error)
      } finally {
        setIsLoaded(true)
      }
    } else {
      // Server-side rendering
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem("quote-items", JSON.stringify(items))
      } catch (error) {
        console.error("Error saving quote to localStorage:", error)
      }
    }
  }, [items, isLoaded])

  const addItem = (newItem: Omit<QuoteItem, "quantity">) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === newItem.id)
      if (existingItem) {
        return prev.map((item) => (item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...newItem, quantity: 1 }]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const clearQuote = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <QuoteContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearQuote,
        totalItems,
        isLoaded,
      }}
    >
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
