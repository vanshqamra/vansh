import type { MetadataRoute } from "next"
import { labSupplyBrands } from "@/lib/data"

const BASE_URL = "https://chemical-corporation-portal.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/products",
    "/products/bulk-chemicals",
    "/products/laboratory-supplies",
    "/products/scientific-instruments",
    "/about",
    "/contact",
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }))

  const brandRoutes = Object.keys(labSupplyBrands).map((brandKey) => ({
    url: `${BASE_URL}/brand/${brandKey}`,
    lastModified: new Date(),
  }))

  return [...staticRoutes, ...brandRoutes]
}
