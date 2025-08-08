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

// ——— helper to normalize any header or raw key to snake_case ———
function normalizeKey(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_");
}

// ——— build a normalized Borosil array before your component ———
const normalizedBorosil = borosilProducts.map((group) => {
  // preserve original header strings (fall back to raw keys if absent)
  const specs_headers = Array.isArray(group.specs_headers) && group.specs_headers.length > 0
    ? group.specs_headers
    : Object.keys(group.variants?.[0] || {});

  // normalize every variant’s keys, and coerce a numeric `price`
  const variants = (group.variants || []).map((rawV) => {
    const v: Record<string, any> = {};
    for (const [k, val] of Object.entries(rawV)) {
      v[normalizeKey(k)] = val;
    }
    // coerce price from any raw field (e.g. "Price /Piece", "price_piece", "price")
    const priceRaw = v[normalizeKey("Price /Piece")] ?? v.price_piece ?? v.price;
    v.price = Number(String(priceRaw).replace(/,/g, "")) || 0;
    return v;
  });

  return { ...group, specs_headers, variants };
});

// ——— export your BrandPage ———
export default function BrandPage({ params }) {
  const brandKey = params.brandName;
  const brand = labSupplyBrands[brandKey];
  if (!brand) notFound();

  const { addItem, isLoaded } = useCart();
  const { toast } = useToast();
  const { searchQuery, setSearchQuery, currentPage, setCurrentPage } = useSearch();
  const [page, setPage] = useState(1);
  const productsPerPage = 50;

  // reset pagination when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  let grouped: Array<any> = [];

  // ——— Borosil branch ———
  if (brandKey === "borosil") {
    // 1) flatten
    const flat: Array<{ variant: Record<string, any>; groupMeta: any }> = [];
    normalizedBorosil.forEach((group, idx) => {
      const { variants, specs_headers } = group;

      // resolve title/category exactly as before
      const resolvedTitle =
        group.product?.trim() ||
        group.title?.trim() ||
        group.category?.trim() ||
        group.description?.split("\n")[0]?.trim() ||
        `Group ${idx + 1}`;
      const resolvedCategory =
        group.category?.trim() || group.product?.trim() || resolvedTitle;

      const baseMeta = {
        ...group,
        title:
          group.title?.toLowerCase().startsWith("untitled group")
            ? resolvedTitle
            : group.title || resolvedTitle,
        category:
          group.category?.toLowerCase().startsWith("untitled group")
            ? resolvedCategory
            : group.category || resolvedCategory,
        specs_headers,
        description: group.description || "",
      };

      variants.forEach((variant) => flat.push({ variant, groupMeta: baseMeta }));
    });

    // 2) filter
    const filtered = flat.filter(({ variant, groupMeta }) => {
      const q = searchQuery.toLowerCase();
      const vm = Object.values(variant).some((v) =>
        String(v).toLowerCase().includes(q),
      );
      const mm =
        groupMeta.title.toLowerCase().includes(q) ||
        groupMeta.category.toLowerCase().includes(q) ||
        groupMeta.description.toLowerCase().includes(q);
      return vm || mm;
    });

    // 3) paginate
    const paginated = filtered.slice((page - 1) * productsPerPage, page * productsPerPage);

    // 4) regroup
    const groupedMap: Record<string, any> = {};
    paginated.forEach(({ variant, groupMeta }) => {
      const key = `${groupMeta.category}—${groupMeta.title}`;
      if (!groupedMap[key]) groupedMap[key] = { ...groupMeta, variants: [] };

      // build each row using only the original header strings
      const row: Record<string, any> = {};
      groupMeta.specs_headers.forEach((header) => {
        const nk = normalizeKey(header);
        row[header] = variant[nk] ?? "—";
      });
      groupedMap[key].variants.push(row);
    });

    grouped = Object.values(groupedMap);
  }

  // ——— Qualigens branch (unchanged) ———
  else if (brandKey === "qualigens") {
    let qualigensProducts: any[] = [];
    try {
      const raw = qualigensProductsRaw.default || qualigensProductsRaw;
      qualigensProducts = Array.isArray(raw.data) ? raw.data : Array.isArray(raw) ? raw : [];
    } catch {
      notFound();
    }

    const filtered = qualigensProducts.filter((p) =>
      Object.values(p).some((v) =>
        String(v).toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    );
    const paginated = filtered.slice((page - 1) * productsPerPage, page * productsPerPage);

    grouped = [
      {
        category: "Qualigens",
        title: "Qualigens Products",
        description: "",
        specs_headers: [
          "Product Code",
          "CAS No",
          "Product Name",
          "Pack Size",
          "Packing",
          "Price",
          "HSN Code",
        ],
        variants: paginated.map((p, i) => ({
          "Product Code": p["Product Code"] || "",
          "CAS No": p["CAS No"] || "",
          "Product Name": p["Product Name"] || "",
          "Pack Size": p["Pack Size"] || "",
          Packing: p["Packing"] || "",
          Price: p["Price"] || "",
          "HSN Code": p["HSN Code"] || "",
        })),
      },
    ];
  }

  // ——— Rankem branch (unchanged) ———
  else if (brandKey === "rankem") {
    // your existing rankem flatten/filter/paginate/regroup logic…
  }

  // ——— Add-to-Cart handler ———
  const handleAdd = (variant: any, group: any) => {
    if (!isLoaded)
      return toast({ title: "Loading...", description: "Please wait", variant: "destructive" });

    const price = variant.price;
    if (typeof price !== "number" || price <= 0)
      return toast({ title: "Invalid Price", description: "Cannot add invalid price.", variant: "destructive" });

    const name =
      variant["Product Name"] ||
      group.title ||
      group.description.split("\n")[0] ||
      "Unnamed Product";
    const catNo = variant["Product Code"] || variant.cat_no || "";

    addItem({
      id: `${brandKey}-${catNo}`,
      name,
      productName: name,
      catNo,
      productCode: variant["Product Code"] || "",
      casNo: variant["CAS No"] || "",
      packSize: variant["Pack Size"] || "",
      packing: variant.Packing || "",
      hsn: variant["HSN Code"] || "",
      price,
      quantity: 1,
      brand: brand.name,
      category: group.category,
      image: null,
    });

    toast({ title: "Added to Cart", description: `${name} added.`, variant: "default" });
  };

  // ——— Pagination count ———
  const totalVariants =
    brandKey === "borosil"
      ? normalizedBorosil.reduce((sum, g) => sum + g.variants.length, 0)
      : brandKey === "qualigens"
      ? normalizedBorosil // not used
      : brandKey === "rankem"
      ? rankemProducts.reduce((sum, g) => sum + (g.variants?.length || 0), 0)
      : 0;
  const totalPages = Math.ceil(totalVariants / productsPerPage);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{brand.name} Products</h1>
      <Input
        type="text"
        placeholder="Search products…"
        className="mb-8 max-w-md"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {grouped.map((group, i) => (
        <div key={`${group.category}-${group.title}-${i}`} className="mb-12">
          <h3 className="text-md uppercase tracking-wider text-gray-500 mb-1">
            {group.category}
          </h3>
          <h2 className="text-xl font-bold text-blue-700 mb-2">{group.title}</h2>
          {group.description && (
            <p className="text-sm text-gray-600 whitespace-pre-line mb-4">
              {group.description}
            </p>
          )}
          {group.specs_headers.length > 0 && (
            <div className="overflow-auto border rounded mb-4">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-xs uppercase font-semibold">
                  <tr>
                    {group.specs_headers.map((h, j) => (
                      <th key={j} className="px-3 py-2 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                    <th className="px-3 py-2 whitespace-nowrap"></th>
                  </tr>
                </thead>
                <tbody>
                  {group.variants.map((variant, k) => {
                    const rowKey = `${brandKey}-${variant["Product Code"] || k}-${k}`;
                    return (
                      <tr key={rowKey} className="border-t">
                        {group.specs_headers.map((h, j) => (
                          <td key={j} className="px-3 py-2 whitespace-nowrap">
                            {variant[h] ?? "—"}
                          </td>
                        ))}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <Button onClick={() => handleAdd(variant, group)} disabled={!isLoaded} size="xs">
                            Add to Cart
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <span className="px-4 py-2 text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {grouped.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your search.</p>
        </div>
      )}
    </div>
  );
}
