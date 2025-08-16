// lib/seo.ts
type Maybe<T = string> = T | undefined | null;

const clean = (v: Maybe) => (typeof v === "string" ? v.trim() : "");
const first = (...vals: Maybe[]) => clean(vals.find((x) => clean(x)) || "");

function packFrom(product: any) {
  return first(
    product.packSize,
    product.size,
    product.capacity,
    product.volume,
    product.diameter,
    product.dimensions,
    product.grade
  );
}
function codeFrom(product: any) {
  return first(
    product.code,
    product.catalog_no,
    product.catalogNo,
    product.catno,
    product.sku,
    product.item_code,
    product.itemCode
  );
}
function brandFrom(product: any, group?: any) {
  return first(
    product.brand,
    group?.brand,
    group?.product,
    product.vendor,
    product.mfg,
    /borosil/i.test(JSON.stringify(product)) ? "Borosil" : "",
  );
}
function nameFrom(product: any, group?: any) {
  return first(
    product.productName,
    product.name,
    product.title,
    group?.title,
    product.product
  );
}
function normalizePrice(p: any) {
  if (p === undefined || p === null) return undefined;
  if (typeof p === "number") return Number.isFinite(p) ? p : undefined;
  const txt = String(p).trim().toUpperCase();
  if (txt === "POR" || txt === "P.O.R" || txt === "P O R") return undefined;
  const num = parseFloat(String(p).replace(/[^\d.]/g, ""));
  return Number.isFinite(num) ? num : undefined;
}

export type ProductSEO = {
  title: string;
  h1: string;
  description: string;
  jsonLd: Record<string, any>;
};

export function getProductSEO(product: any, group?: any, canonicalUrl?: string): ProductSEO {
  const brand = brandFrom(product, group);
  const name  = nameFrom(product, group);
  const pack  = packFrom(product);
  const code  = codeFrom(product);

  const titleParts = [brand, name, pack].filter(Boolean).join(" ");
  const codeSuffix = code ? ` – ${code}` : "";
  const title = `${titleParts}${codeSuffix} | Buy Online – Chemical Corporation`;

  const h1 = `${[brand, name].filter(Boolean).join(" ")}${pack ? ` – ${pack}` : ""}${code ? ` (Code: ${code})` : ""}`;

  const hsn = first(product.hsn, product.hsnCode, product["HSN Code"]);
  const cas = first(product.cas, product.casNo, product.cas_number, product["CAS No"]);

  const description = `Buy ${[brand, name, pack].filter(Boolean).join(" ")} online in India. Genuine ${
    brand || "laboratory"
  } product${code ? ` (Code: ${code})` : ""}${hsn ? `, HSN ${hsn}` : ""}${cas ? `, CAS ${cas}` : ""}. Discount auto-applies in cart. Fast delivery.`;

  const price = normalizePrice((product as any).price ?? (product as any).Price ?? (product as any).rate ?? (product as any).price_inr);
  const offers: Record<string, any> = {
    "@type": "Offer",
    priceCurrency: "INR",
    availability: "http://schema.org/InStock",
  };
  if (price !== undefined) offers.price = price;
  if (canonicalUrl) offers.url = canonicalUrl;

  const jsonLd: Record<string, any> = {
    "@context": "http://schema.org",
    "@type": "Product",
    name: [brand, name, pack].filter(Boolean).join(" "),
    brand: brand ? { "@type": "Brand", name: brand } : undefined,
    sku: code || undefined,
    mpn: code || undefined,
    additionalProperty: [
      hsn ? { "@type": "PropertyValue", name: "HSN", value: hsn } : null,
      cas ? { "@type": "PropertyValue", name: "CAS", value: cas } : null,
    ].filter(Boolean),
    offers,
  };

  return { title, h1, description, jsonLd };
}
