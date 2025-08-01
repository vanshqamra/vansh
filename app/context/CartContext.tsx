"use client"

import { createContext, useContext, useState, type ReactNode, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: Omit<CartItem, "quantity">) => void
  updateCartQuantity: (id: string, quantity: number) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const { toast } = useToast()

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity">) => {
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((cartItem) => cartItem.id === item.id)
        if (existingItem) {
          toast({
            title: "Item Already in Cart",
            description: `${item.name} is already in your cart. Quantity updated.`,
          })
          return prevItems.map((cartItem) =>
            cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
          )
        } else {
          toast({
            title: "Added to Cart",
            description: `${item.name} has been added to your cart.`,
          })
          return [...prevItems, { ...item, quantity: 1 }]
        }
      })
    },
    [toast],
  )

  const updateCartQuantity = useCallback((id: string, quantity: number) => {
    setCartItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }, [])

  const removeFromCart = useCallback(
    (id: string) => {
      setCartItems((prevItems) => {
        const removedItem = prevItems.find((item) => item.id === id)
        if (removedItem) {
          toast({
            title: "Removed from Cart",
            description: `${removedItem.name} has been removed from your cart.`,
          })
        }
        return prevItems.filter((item) => item.id !== id)
      })
    },
    [toast],
  )

  const clearCart = useCallback(() => {
    setCartItems([])
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart.",
    })
  }, [toast])

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [cartItems])

  const getCartTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }, [cartItems])

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartTotalItems,
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
