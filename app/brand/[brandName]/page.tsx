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

// ——— helper to normalize any header/raw-key to snake_case ———
function normalizeKey(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_");
}

// ——— pre-process Borosil: preserve original headers, normalize every variant ———
const normalizedBorosil = borosilProducts.map((group) => {
  const specs_headers =
    Array.isArray(group.specs_headers) && group.specs_headers.length > 0
      ? group.specs_headers.map((h) => h.trim())
      : Object.keys(group.variants?.[0] || {});

  const variants = (group.variants || []).map((rawV) => {
    const v: Record<string, any> = {};
    // normalize all fields
    for (const [k, val] of Object.entries(rawV)) {
      v[normalizeKey(k)] = val;
    }
    // coerce a numeric price
    const priceRaw =
      v[normalizeKey("Price /Piece")] ??
      v.price_piece ??
      v.price;
    v.price = Number(String(priceRaw).replace(/,/g, "")) || 0;
    // unify code field
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
  const [page, setPage] = useState(1);
  const productsPerPage = 50;

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  let grouped: Array<any> = [];

  // ——— Borosil ———
  if (brandKey === "borosil") {
    // 1) flatten
    const flat: Array<{ variant: Record<string, any>; groupMeta: any }> = [];
    normalizedBorosil.forEach((group, idx) => {
      const { specs_headers, variants } = group;

      // resolve titles/categories as before
      const resolvedTitle =
        group.product?.trim() ||
        group.title?.trim() ||
        group.category?.trim() ||
        group.description?.split("\n")[0]?.trim() ||
        `Group ${idx + 1}`;
      const resolvedCategory =
        group.category?.trim() ||
        group.product?.trim() ||
        resolvedTitle;

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

      variants.forEach((variant) => {
        flat.push({ variant, groupMeta: baseMeta });
      });
    });

    // 2) filter
    const filtered = flat.filter(({ variant, groupMeta }) => {
      const q = searchQuery.toLowerCase();
      return (
        Object.values(variant).some((v) =>
          String(v).toLowerCase().includes(q)
        ) ||
        groupMeta.title.toLowerCase().includes(q) ||
        groupMeta.category.toLowerCase().includes(q) ||
        groupMeta.description.toLowerCase().includes(q)
      );
    });

    // 3) paginate
    const paginated = filtered.slice(
      (page - 1) * productsPerPage,
      page * productsPerPage
    );

    // 4) regroup, **including** Code & Price fields
    const map: Record<string, any> = {};
    paginated.forEach(({ variant, groupMeta }) => {
      const key = `${groupMeta.category}-${groupMeta.title}`;
      if (!map[key]) map[key] = { ...groupMeta, variants: [] };

      // build a single “row” object
      const row: Record<string, any> = {};
      row["Code"] = variant.code;
      groupMeta.specs_headers.forEach((header) => {
        const nk = normalizeKey(header);
        row[header] = variant[nk] ?? "—";
      });
      row["Price"] = variant.price;

      map[key].variants.push(row);
    });

    grouped = Object.values(map);
  }

  // ——— Qualigens (unchanged) ———
  else if (brandKey === "qualigens") {
    let qualigensProducts: any[] = [];
    try {
      const raw = qualigensProductsRaw.default || qualigensProductsRaw;
      qualigensProducts = Array.isArray(raw.data)
        ? raw.data
        : Array.isArray(raw)
        ? raw
        : [];
    } catch {
      notFound();
    }

    const filtered = qualigensProducts.filter((p) =>
      Object.values(p).some((v) =>
        String(v).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    const paginated = filtered.slice(
      (page - 1) * productsPerPage,
      page * productsPerPage
    );

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
        variants: paginated.map((p) => ({
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

  // ——— Rankem (unchanged) ———
  else if (brandKey === "rankem") {
    // your existing flatten/filter/paginate/regroup logic for Rankem…
  }

  // ——— Add to Cart handler ———
  const handleAdd = (row: any, group: any) => {
    if (!isLoaded)
      return toast({
        title: "Loading...",
        description: "Please wait",
        variant: "destructive",
      });

    const price = row["Price"];
    if (typeof price !== "number" || price <= 0)
      return toast({
        title: "Invalid Price",
        description: "Cannot add invalid price.",
        variant: "destructive",
      });

    const name = group.title;
    const catNo = row["Code"] || "";

    addItem({
      id: `${brandKey}-${catNo}`,
      name,
      productName: name,
      catNo,
      productCode: catNo,
      casNo: "",
      packSize: "",
      packing: "",
      hsn: "",
      price,
      quantity: 1,
      brand: brand.name,
      category: group.category,
      image: null,
    });

    toast({
      title: "Added to Cart",
      description: `${name} added successfully.`,
      variant: "default",
    });
  };

  // ——— Pagination ———
  const totalVariants =
    brandKey === "borosil"
      ? normalizedBorosil.reduce((sum, g) => sum + g.variants.length, 0)
      : brandKey === "qualigens"
      ? (qualigensProductsRaw.default || qualigensProductsRaw).data?.length || 0
      : brandKey === "rankem"
      ? rankemProducts.reduce((sum, g) => sum + (g.variants?.length || 0), 0)
      : 0;
  const totalPages = Math.ceil(totalVariants / productsPerPage);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">{brand.name} Products</h1>
      <Input
        type="text"
        placeholder="Search products..."
        className="mb-8 max-w-md"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {grouped.map((group, gi) => (
        <div key={`group-${gi}-${group.title}`} className="mb-12">
          <h3 className="text-md uppercase tracking-wider text-gray-500 mb-1">
            {group.category}
          </h3>
          <h2 className="text-xl font-bold text-blue-700 mb-2">
            {group.title}
          </h2>
          {group.description && (
            <p className="text-sm text-gray-600 whitespace-pre-line mb-4">
              {group.description}
            </p>
          )}

          {group.variants.length > 0 && (
            <div className="overflow-auto border rounded mb-4">
              <table className="min-w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-3 py-2">Code</th>
                    {group.specs_headers.map((h, i) => (
                      <th key={i} className="px-3 py-2">
                        {h}
                      </th>
                    ))}
                    <th className="px-3 py-2">Price</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {group.variants.map((row, ri) => (
                    <tr key={`row-${gi}-${ri}`} className="border-t">
                      <td className="px-3 py-2">{row["Code"]}</td>
                      {group.specs_headers.map((h, ci) => (
                        <td key={ci} className="px-3 py-2">
                          {row[h]}
                        </td>
                      ))}
                      <td className="px-3 py-2">{row["Price"]}</td>
                      <td className="px-3 py-2">
                        <Button
                          size="xs"
                          onClick={() => handleAdd(row, group)}
                          disabled={!isLoaded}
                        >
                          Add to Cart
                        </Button>
                      </td>
                    </tr>
                  ))}
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
