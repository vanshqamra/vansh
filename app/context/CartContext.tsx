"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  brand?: string
  category?: string
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
  const items = state?.items || []

  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = items.find((item) => item.id === action.payload.id)
      let newItems: CartItem[]

      if (existingItem) {
        newItems = items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) } : item,
        )
      } else {
        newItems = [...items, { ...action.payload, quantity: action.payload.quantity || 1 }]
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
      const newItems = items.filter((item) => item.id !== action.payload)
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

      return {
        items: newItems,
        itemCount,
        total,
      }
    }

    case "UPDATE_QUANTITY": {
      const newItems = items
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
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: "LOAD_CART", payload: parsedCart })
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state))
  }, [state])

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    dispatch({ type: "ADD_ITEM", payload: item })
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart }}>
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
