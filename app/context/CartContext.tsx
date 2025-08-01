"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useState } from "react"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  brand?: string
  category?: string
  image?: string
}

export interface CartState {
  items: CartItem[]
  itemCount: number
  total: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> & { quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState }

const initialState: CartState = {
  items: [],
  itemCount: 0,
  total: 0,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id)
      let newItems: CartItem[]

      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) } : item,
        )
      } else {
        newItems = [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
      }

      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

      return {
        items: newItems,
        itemCount,
        total,
      }
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

      return {
        items: newItems,
        itemCount,
        total,
      }
    }

    case "UPDATE_QUANTITY": {
      const newItems = state.items
        .map((item) =>
          item.id === action.payload.id ? { ...item, quantity: Math.max(0, action.payload.quantity) } : item,
        )
        .filter((item) => item.quantity > 0)

      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

      return {
        items: newItems,
        itemCount,
        total,
      }
    }

    case "CLEAR_CART":
      return initialState

    case "LOAD_CART":
      return action.payload

    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isLoaded: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart)
          // Validate the parsed cart structure
          if (parsedCart && typeof parsedCart === "object") {
            if (parsedCart.items && Array.isArray(parsedCart.items)) {
              // New format with full state
              dispatch({ type: "LOAD_CART", payload: parsedCart })
            } else if (Array.isArray(parsedCart)) {
              // Old format with just items array
              const itemCount = parsedCart.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)
              const total = parsedCart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0)
              dispatch({ type: "LOAD_CART", payload: { items: parsedCart, itemCount, total } })
            }
          }
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
        localStorage.removeItem("cart")
      } finally {
        setIsLoaded(true)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem("cart", JSON.stringify(state))
      } catch (error) {
        console.error("Error saving cart to localStorage:", error)
      }
    }
  }, [state, isLoaded])

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    if (!isLoaded) return
    dispatch({ type: "ADD_ITEM", payload: item })
  }

  const removeItem = (id: string) => {
    if (!isLoaded) return
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (!isLoaded) return
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const clearCart = () => {
    if (!isLoaded) return
    dispatch({ type: "CLEAR_CART" })
  }

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart, isLoaded }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
