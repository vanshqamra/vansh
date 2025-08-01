"use client"

import { createContext, useContext, useState, type ReactNode, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

interface QuoteItem {
  id: string
  name: string
  quantity: number
  unit: string
  price?: number // Optional, as price might not be known for a quote
}

interface QuoteContextType {
  quoteItems: QuoteItem[]
  addToQuote: (item: Omit<QuoteItem, "id">) => void
  updateQuoteQuantity: (id: string, quantity: number) => void
  removeFromQuote: (id: string) => void
  clearQuote: () => void
  getQuoteTotalItems: () => number
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined)

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const { toast } = useToast()

  const addToQuote = useCallback(
    (item: Omit<QuoteItem, "id">) => {
      setQuoteItems((prevItems) => {
        const existingItem = prevItems.find((qi) => qi.name === item.name && qi.unit === item.unit)
        if (existingItem) {
          toast({
            title: "Item Already in Quote",
            description: `${item.name} (${item.unit}) is already in your quote cart. You can update its quantity there.`,
          })
          return prevItems // Do not add duplicate, let user update quantity in cart
        } else {
          const newItem = { ...item, id: crypto.randomUUID() }
          toast({
            title: "Added to Quote Cart",
            description: `${newItem.name} (${newItem.unit}) has been added to your quote cart.`,
          })
          return [...prevItems, newItem]
        }
      })
    },
    [toast],
  )

  const updateQuoteQuantity = useCallback((id: string, quantity: number) => {
    setQuoteItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }, [])

  const removeFromQuote = useCallback(
    (id: string) => {
      setQuoteItems((prevItems) => {
        const removedItem = prevItems.find((item) => item.id === id)
        if (removedItem) {
          toast({
            title: "Removed from Quote Cart",
            description: `${removedItem.name} (${removedItem.unit}) has been removed.`,
          })
        }
        return prevItems.filter((item) => item.id !== id)
      })
    },
    [toast],
  )

  const clearQuote = useCallback(() => {
    setQuoteItems([])
    toast({
      title: "Quote Cart Cleared",
      description: "All items have been removed from your quote cart.",
    })
  }, [toast])

  const getQuoteTotalItems = useCallback(() => {
    return quoteItems.reduce((total, item) => total + item.quantity, 0)
  }, [quoteItems])

  return (
    <QuoteContext.Provider
      value={{
        quoteItems,
        addToQuote,
        updateQuoteQuantity,
        removeFromQuote,
        clearQuote,
        getQuoteTotalItems,
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
