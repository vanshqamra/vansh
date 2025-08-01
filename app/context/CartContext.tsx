"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  brand?: string
  category?: string
  casNumber?: string
  packSize?: string
  image?: string
}

interface CartState {
  items: CartItem[]
  itemCount: number
  total: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState }

interface CartContextType {
  state: CartState
  addToCart: (item: Omit<CartItem, "quantity">) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const initialState: CartState = {
  items: [],
  itemCount: 0,
  total: 0,
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items?.find((item) => item.id === action.payload.id)

      let newItems: CartItem[]
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      } else {
        newItems = [...(state.items || []), { ...action.payload, quantity: 1 }]
      }

      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

      return {
        items: newItems,
        itemCount: newItemCount,
        total: newTotal,
      }
    }

    case "REMOVE_ITEM": {
      const newItems = (state.items || []).filter((item) => item.id !== action.payload)
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

      return {
        items: newItems,
        itemCount: newItemCount,
        total: newTotal,
      }
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: action.payload.id })
      }

      const newItems = (state.items || []).map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
      )

      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
      const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

      return {
        items: newItems,
        itemCount: newItemCount,
        total: newTotal,
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { toast } = useToast()

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: "LOAD_CART", payload: parsedCart })
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(state))
    } catch (error) {
      console.error("Error saving cart to localStorage:", error)
    }
  }, [state])

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    dispatch({ type: "ADD_ITEM", payload: { ...item, quantity: 1 } })
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
    })
  }

  const removeFromCart = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart",
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
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
