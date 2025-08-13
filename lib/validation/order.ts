import { z } from "zod"

/**
 * Very loose item schema – the API normalizes the important fields
 * so we accept a wide variety of keys from different frontends.
 */
export const OrderItemSchema = z.object({
  sku: z.any().optional(),
  code: z.any().optional(),
  product_code: z.any().optional(),
  id: z.any().optional(),
  name: z.any().optional(),
  product_name: z.any().optional(),
  title: z.any().optional(),
  qty: z.any().optional(),
  quantity: z.any().optional(),
  count: z.any().optional(),
})

/**
 * Create order payload.  Historically our clients sent many different
 * shapes, so keep this schema permissive and let the route handler
 * perform deeper normalization.
 */
export const CreateOrderSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    company_name: z.string().optional(),
    gst: z.string().optional(),
    shipping_address: z.any().optional(),
    billing_address: z.any().optional(),
    items: z.array(OrderItemSchema).optional(),
    products: z.array(OrderItemSchema).optional(),
    subtotal: z.number().nonnegative().optional(),
    tax: z.number().nonnegative().optional(),
    shipping: z.number().nonnegative().optional(),
    discount: z.number().optional(),
    total: z.number().nonnegative().optional(),
    grand_total: z.number().nonnegative().optional(),
    // common flat address fields that older clients used
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    country: z.string().optional(),
    notes: z.string().optional(),
    source: z.string().optional(),
    customer: z.any().optional(),
    totals: z.any().optional(),
  })
  .refine((d) => Array.isArray(d.items) || Array.isArray(d.products), {
    message: "items or products must be provided",
    path: ["items"],
  })

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type OrderItemInput = z.infer<typeof OrderItemSchema>
