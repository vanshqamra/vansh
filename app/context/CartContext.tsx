"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Product = {
  code: string
  name: string
  packSize: string
  material: string
  price: string
}

type CartItem = Product & {
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (code: string) => void
  updateQuantity: (code: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  isLoaded: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        if (typeof window !== "undefined") {
          const savedCart = localStorage.getItem("chemical-corp-cart")
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart)
            if (Array.isArray(parsedCart)) {
              setCart(parsedCart)
            }
          }
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      } finally {
        setIsLoaded(true)
      }
    }

    // Use setTimeout to ensure this runs after hydration
    const timeoutId = setTimeout(loadCart, 0)
    return () => clearTimeout(timeoutId)
  }, [])

  // Save cart to localStorage whenever cart changes (but only after initial load)
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      try {
        localStorage.setItem("chemical-corp-cart", JSON.stringify(cart))
      } catch (error) {
        console.error("Error saving cart to localStorage:", error)
      }
    }
  }, [cart, isLoaded])

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.code === product.code)
      if (existing) {
        return prevCart.map((item) => (item.code === product.code ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (code: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.code !== code))
  }

  const updateQuantity = (code: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(code)
      return
    }
    setCart((prevCart) => prevCart.map((item) => (item.code === code ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        isLoaded,
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
