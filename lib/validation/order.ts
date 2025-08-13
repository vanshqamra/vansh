import { z } from "zod"

export const OrderItemSchema = z.object({
  sku: z.string().optional(),
  name: z.string(),
  qty: z.number().int().positive(),
  price: z.number().nonnegative(),
})

export const CreateOrderSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  company_name: z.string().optional(),
  gst: z.string().optional(),
  shipping_address: z.any().optional(),
  billing_address: z.any().optional(),
  items: z.array(OrderItemSchema).nonempty(),
  subtotal: z.number(),
  tax: z.number(),
  shipping: z.number(),
  discount: z.number().optional().default(0),
  total: z.number(),
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type OrderItemInput = z.infer<typeof OrderItemSchema>
