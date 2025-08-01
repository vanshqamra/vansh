"use client"

import { createContext, useReducer, useContext, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  brand?: string
  category?: string
  packSize?: string
  casNumber?: string
  image?: string
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState }

interface CartContextType {
  state: CartState
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const newItem = action.payload
      const existingItemIndex = state.items.findIndex((item) => item.id === newItem.id)

      let updatedItems: CartItem[]
      if (existingItemIndex > -1) {
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + newItem.quantity } : item,
        )
      } else {
        updatedItems = [...state.items, { ...newItem, quantity: newItem.quantity || 1 }]
      }

      const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const newItemCount = updatedItems.reduce((count, item) => count + item.quantity, 0)

      return {
        ...state,
        items: updatedItems,
        total: newTotal,
        itemCount: newItemCount,
      }
    }
    case "REMOVE_ITEM": {
      const idToRemove = action.payload
      const updatedItems = state.items.filter((item) => item.id !== idToRemove)
      const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const newItemCount = updatedItems.reduce((count, item) => count + item.quantity, 0)

      return {
        ...state,
        items: updatedItems,
        total: newTotal,
        itemCount: newItemCount,
      }
    }
    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload
      const updatedItems = state.items
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item))
        .filter((item) => item.quantity > 0) // Remove if quantity becomes 0

      const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const newItemCount = updatedItems.reduce((count, item) => count + item.quantity, 0)

      return {
        ...state,
        items: updatedItems,
        total: newTotal,
        itemCount: newItemCount,
      }
    }
    case "CLEAR_CART":
      return initialState
    case "LOAD_CART":
      // Ensure payload has correct structure, default to empty if not
      const loadedState = action.payload
      return {
        items: Array.isArray(loadedState?.items) ? loadedState.items : [],
        total: typeof loadedState?.total === "number" ? loadedState.total : 0,
        itemCount: typeof loadedState?.itemCount === "number" ? loadedState.itemCount : 0,
      }
    default:
      return state
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { toast } = useToast()

  // Load cart from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          dispatch({ type: "LOAD_CART", payload: parsedCart })
        } catch (error) {
          console.error("Failed to parse cart from localStorage", error)
          // Optionally clear corrupted cart
          localStorage.removeItem("cart")
          toast({
            title: "Cart Error",
            description: "Your saved cart data was corrupted and has been reset.",
            variant: "destructive",
          })
        }
      }
    }
  }, [toast])

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(state))
    }
  }, [state])

  const addItem = (item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item })
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
    toast({
      title: "Item Removed",
      description: "Product has been removed from your cart.",
      variant: "default",
    })
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

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
