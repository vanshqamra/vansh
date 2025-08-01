"use client"

import { createContext, useReducer, useContext, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast" // Corrected import path for useToast

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string // Made optional as not all products might have it
  brand?: string
  category?: string
  packSize?: string
  cas?: string
  hsn?: string
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

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
}

const calculateTotals = (items: CartItem[]) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  return { total, itemCount }
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const newItem = action.payload
      const existingItemIndex = state.items.findIndex((item) => item.id === newItem.id)

      let updatedItems
      if (existingItemIndex > -1) {
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: item.quantity + newItem.quantity } : item,
        )
      } else {
        updatedItems = [...state.items, newItem]
      }
      const { total, itemCount } = calculateTotals(updatedItems)
      return { ...state, items: updatedItems, total, itemCount }
    }
    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter((item) => item.id !== action.payload)
      const { total, itemCount } = calculateTotals(updatedItems)
      return { ...state, items: updatedItems, total, itemCount }
    }
    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        return cartReducer(state, { type: "REMOVE_ITEM", payload: id })
      }
      const updatedItems = state.items.map((item) => (item.id === id ? { ...item, quantity: quantity } : item))
      const { total, itemCount } = calculateTotals(updatedItems)
      return { ...state, items: updatedItems, total, itemCount }
    }
    case "CLEAR_CART":
      return initialState
    case "LOAD_CART":
      // Ensure payload has correct structure, default to empty if not
      const loadedItems = Array.isArray(action.payload?.items) ? action.payload.items : []
      const loadedTotal = typeof action.payload?.total === "number" ? action.payload.total : 0
      const loadedItemCount = typeof action.payload?.itemCount === "number" ? action.payload.itemCount : 0
      return {
        items: loadedItems,
        total: loadedTotal,
        itemCount: loadedItemCount,
      }
    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addItem: (item: CartItem) => void // Renamed from addToCart to addItem
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { toast } = useToast()

  // Load cart from localStorage on initial mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart")
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart)
        // Validate parsedCart structure before loading
        if (
          parsedCart &&
          Array.isArray(parsedCart.items) &&
          typeof parsedCart.total === "number" &&
          typeof parsedCart.itemCount === "number"
        ) {
          dispatch({ type: "LOAD_CART", payload: parsedCart })
        } else {
          console.warn("Invalid cart data in localStorage, clearing cart.")
          dispatch({ type: "CLEAR_CART" })
        }
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
      dispatch({ type: "CLEAR_CART" }) // Clear cart if parsing fails
    }
  }, [])

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state))
  }, [state])

  const addItem = (item: CartItem) => {
    // Renamed from addToCart to addItem
    dispatch({ type: "ADD_ITEM", payload: item })
    toast({
      title: "Item Added",
      description: `${item.name} added to cart.`,
      variant: "default",
    })
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
    toast({
      title: "Item Removed",
      description: "Item removed from cart.",
      variant: "destructive",
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
    toast({
      title: "Cart Cleared",
      description: "Your cart has been emptied.",
      variant: "default",
    })
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
