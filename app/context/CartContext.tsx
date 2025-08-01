"use client"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  id: string
  name: string
  price: number
  image?: string
  brand?: string
  packSize?: string
  casNumber?: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  shippingCost: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState }

const initialCartState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  shippingCost: 0, // Example: free shipping
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const newItem = action.payload
      const existingItem = state.items.find((item) => item.id === newItem.id)

      let updatedItems
      if (existingItem) {
        updatedItems = state.items.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity } : item,
        )
      } else {
        updatedItems = [...state.items, { ...newItem, quantity: newItem.quantity || 1 }]
      }
      return calculateCartTotals({ ...state, items: updatedItems })
    }
    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter((item) => item.id !== action.payload)
      return calculateCartTotals({ ...state, items: updatedItems })
    }
    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload
      const updatedItems = state.items
        .map((item) => (item.id === id ? { ...item, quantity: quantity } : item))
        .filter((item) => item.quantity > 0) // Remove if quantity becomes 0 or less
      return calculateCartTotals({ ...state, items: updatedItems })
    }
    case "CLEAR_CART":
      return calculateCartTotals({ ...initialCartState })
    case "LOAD_CART":
      return calculateCartTotals(action.payload)
    default:
      return state
  }
}

const calculateCartTotals = (state: CartState): CartState => {
  const newTotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const newItemCount = state.items.reduce((count, item) => count + item.quantity, 0)
  // Example: Free shipping for orders over 5000, otherwise 500
  const newShippingCost = newTotal >= 5000 ? 0 : 500

  return {
    ...state,
    total: newTotal,
    itemCount: newItemCount,
    shippingCost: newShippingCost,
  }
}

interface CartContextType {
  state: CartState
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState)
  const { toast } = useToast()

  // Load cart from localStorage on initial mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("chemical_corp_cart")
      if (storedCart) {
        dispatch({ type: "LOAD_CART", payload: JSON.parse(storedCart) })
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
      toast({
        title: "Cart Load Error",
        description: "Could not load your previous cart. Starting with an empty cart.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("chemical_corp_cart", JSON.stringify(state))
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error)
      toast({
        title: "Cart Save Error",
        description: "Could not save your cart changes.",
        variant: "destructive",
      })
    }
  }, [state, toast])

  const addItem = (item: CartItem) => {
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
