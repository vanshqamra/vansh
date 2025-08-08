"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { labSupplyBrands } from "@/lib/data";
import borosilProducts from "@/lib/borosil_products_absolute_final.json";
import qualigensProductsRaw from "@/lib/qualigens-products.json";
import rankemProducts from "@/lib/rankem_products.json";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/app/context/search-context";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// ——— helper to normalize strings to snake_case ———
function normalizeKey(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_");
}

// ——— determine visible columns based on data rows ———
function getVisibleColumns(
  rows: Array<Record<string, any>>,
  specs_headers: string[]
) {
  const showCode = rows.some(r => Boolean(r.__code));
  const showPrice = rows.some(r => typeof r.__price === "number" && r.__price > 0);
  const visibleSpecs = specs_headers.filter(h =>
    rows.some(r => {
      const v = r[h];
      return v !== undefined && v !== "" && v !== "—";
    })
  );
  return { showCode, visibleSpecs, showPrice };
}

// ——— pre-process Borosil: keep original specs, normalize variants ———
const normalizedBorosil = borosilProducts.map(group => {
  const specs_headers =
    Array.isArray(group.specs_headers) && group.specs_headers.length > 0
      ? group.specs_headers.map(h => h.trim())
      : Object.keys(group.variants?.[0] || {});

  const variants = (group.variants || []).map(raw => {
    const v: Record<string, any> = {};
    Object.entries(raw).forEach(([k, val]) => {
      v[normalizeKey(k)] = val;
    });
    const rawPrice = v[normalizeKey("Price /Piece")] ?? v.price_piece ?? v.price;
    v.price = Number(String(rawPrice).replace(/,/g, "")) || 0;
    v.code = v.code ?? v.product_code ?? "";
    return v;
  });

  return { ...group, specs_headers, variants };
});

export default function BrandPage({ params }) {
  const brandKey = params.brandName;
  const brand = labSupplyBrands[brandKey];
  if (!brand) notFound();

  const { addItem, isLoaded } = useCart();
  const { toast } = useToast();
  const { searchQuery, setSearchQuery } = useSearch();

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialPage = Number(searchParams.get("page") || "1");
  const [page, setPage] = useState(initialPage);
  const productsPerPage = 50;

  useEffect(() => {
    const qp = new URLSearchParams();
    qp.set("page", page.toString());
    router.replace(`${pathname}?${qp.toString()}`, { scroll: false });
  }, [page, router, pathname]);

  useEffect(() => setPage(1), [searchQuery]);

  let grouped: Array<any> = [];

  // ——— Borosil branch ———
  if (brandKey === "borosil") {
    const flat: Array<{ row: Record<string, any>; meta: any }> = [];
    normalizedBorosil.forEach((group, idx) => {
      const { specs_headers, variants } = group;
      const title =
        group.title && !group.title.toLowerCase().startsWith("untitled group")
          ? group.title
          : group.product?.trim() || group.category?.trim() ||
            group.description?.split("\n")[0]?.trim() || `Group ${idx + 1}`;
      const category =
        group.category && !group.category.toLowerCase().startsWith("untitled group")
          ? group.category
          : group.product?.trim() || title;

      variants.forEach(variant => {
        const row: Record<string, any> = {};
        specs_headers.forEach(h => {
          const val = variant[normalizeKey(h)];
          row[h] = val != null && val !== "" ? val : "—";
        });
        row.__code = variant.code;
        row.__price = variant.price;
        flat.push({ row, meta: { ...group, title, category } });
      });
    });

    const filtered = flat.filter(({ row, meta }) => {
      const q = searchQuery.toLowerCase();
      return (
        Object.values(row).some(v => String(v).toLowerCase().includes(q)) ||
        meta.title.toLowerCase().includes(q) ||
        meta.category.toLowerCase().includes(q) ||
        meta.description.toLowerCase().includes(q)
      );
    });

    const paginated = filtered.slice((page - 1) * productsPerPage, page * productsPerPage);

    const map: Record<string, any> = {};
    paginated.forEach(({ row, meta }) => {
      const key = `${meta.category}-${meta.title}`;
      if (!map[key]) map[key] = { ...meta, specs_headers: meta.specs_headers, variants: [] };
      map[key].variants.push(row);
    });

    grouped = Object.values(map);
  }

  // ——— Qualigens branch ———
  else if (brandKey === "qualigens") {
    let qualigensProducts: any[] = [];
    try {
      const raw = qualigensProductsRaw.default || qualigensProductsRaw;
      qualigensProducts = Array.isArray(raw.data) ? raw.data : Array.isArray(raw) ? raw : [];
    } catch {
      notFound();
    }

    const filtered = qualigensProducts.filter(p =>
      Object.values(p).some(v => String(v).toLowerCase().includes(searchQuery.toLowerCase()))
    );
    const paginated = filtered.slice((page - 1) * productsPerPage, page * productsPerPage);

    grouped = [
      {
        category: "Qualigens",
        title: "Qualigens Products",
        description: "",
        specs_headers: ["Product Code","CAS No","Product Name","Pack Size","Packing","Price","HSN Code"],
        variants: paginated.map(p => ({
          "Product Code": p["Product Code"] || "",
          "CAS No": p["CAS No"] || "",
          "Product Name": p["Product Name"] || "",
          "Pack Size": p["Pack Size"] || "",
          Packing: p["Packing"] || "",
          Price: p["Price"] || "",
          "HSN Code": p["HSN Code"] || ""
        }))
      }
    ];
  }

  // ——— Rankem branch ———
  else if (brandKey === "rankem") {
    const flat: Array<{ row: any; meta: any }> = [];
    rankemProducts.forEach(group => {
      const variants = group.variants || [];
      variants.forEach(v => flat.push({ row: v, meta: group }));
    });
    const filtered = flat.filter(({ row, meta }) =>
      Object.values(row).some(v => String(v).toLowerCase().includes(searchQuery.toLowerCase())) ||
      meta.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const paginated = filtered.slice((page - 1) * productsPerPage, page * productsPerPage);
    const map: Record<string, any> = {};
    paginated.forEach(({ row, meta }) => {
      const key = `${meta.category}-${meta.title}`;
      if (!map[key]) map[key] = { ...meta, specs_headers: [], variants: [] };
      map[key].variants.push(row);
    });
    grouped = Object.values(map);
  }

  // ——— Add to Cart handler ———
  const handleAdd = (row: any, group: any) => {
    if (!isLoaded) return toast({ title: "Loading...", description: "Please wait", variant: "destructive" });
    const price = row.__price;
    if (typeof price !== "number" || price <= 0) return toast({ title: "Invalid Price", description: "Cannot add invalid price.", variant: "destructive" });
    const code = row.__code;
    const name = row["Product Name"] || group.title;
    addItem({ id: `${brandKey}-${code}`, name, productName: name, catNo: code, productCode: code, price, quantity: 1, brand: brand.name, category: group.category, image: null });
    toast({ title: "Added to Cart", description: `${name} added.`, variant: "default" });
  };

  const total = grouped.reduce((sum, g) => sum + g.variants.length, 0);
  const totalPages = Math.ceil(total / productsPerPage);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{brand.name} Products</h1>
      <Input type="text" placeholder="Search products..." className="mb-8 max-w-md" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      {grouped.map((group, gi) => {
        const { showCode, visibleSpecs, showPrice } = getVisibleColumns(group.variants, group.specs_headers);
        return (
          <div key={`grp-${gi}`} className="mb-12">
            <h3 className="text-md uppercase tracking-wider text-gray-500 mb-1">{group.category}</h3>
            <h2 className="text-xl font-bold text-blue-700 mb-2">{group.title}</h2>
            {group.description && <p className="text-sm text-gray-600 whitespace-pre-line mb-4">{group.description}</p>}
            <div className="overflow-auto border rounded mb-4">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-xs uppercase font-semibold"><tr>
                  {showCode && <th className="px-3 py-2">Code</th>}
                  {visibleSpecs.map((h,i) => <th key={i} className="px-3 py-2">{h}</th>)}
                  {showPrice && <th className="px-3 py-2">Price</th>}
                  <th className="px-3 py-2"></th>
                </tr></thead>
                <tbody>
                  {group.variants.map((row, ri) => (
                    <tr key={`row-${gi}-${ri}`} className="border-t">
                      {showCode && <td className="px-3 py-2">{row.__code}</td>}
                      {visibleSpecs.map((h, ci) => <td key={ci} className="px-3 py-2">{row[h]}</td>)}
                      {showPrice && <td className="px-3 py-2">{row.__price}</td>}
                      <td className="px-3 py-2"><Button size="xs" onClick={() => handleAdd(row, group)} disabled={!isLoaded}>Add to Cart</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
          <span className="px-4 py-2 text-sm">Page {page} of {totalPages}</span>
          <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
        </div>
      )}
      {grouped.length === 0 && <div className="text-center py-12"><p className="text-gray-500">No products found matching your search.</p></div>}
    </div>
  );
}
