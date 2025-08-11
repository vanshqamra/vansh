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

// --- Normalize keys for matching
function normalizeKey(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_");
}

// --- Helper to get all possible field names for a logical field
function codeKeys() {
  return ["code", "product_code", "Product Code"];
}
function priceKeys() {
  return [
    "price",
    "Price",
    "price_piece",
    "price_/piece",
    "Price /Piece",
    "Price/ Piece",
    "Price/ Each"
  ];
}

// --- Get the best match for a logical field in a variant
function getField(variant, keys) {
  for (const k of keys) {
    if (variant[k] !== undefined && variant[k] !== "") return variant[k];
    const nk = normalizeKey(k);
    if (variant[nk] !== undefined && variant[nk] !== "") return variant[nk];
  }
  return "";
}

// --- Borosil ---
if (brandKey === "borosil") {
  const flat: Array<{ variant: any; groupMeta: any }> = []
  normalizedBorosil.forEach((group, idx) => {
    const { specs_headers, variants } = group
    const resolvedTitle =
      group.product?.trim() ||
      group.title?.trim() ||
      group.category?.trim() ||
      group.description?.split("\n")[0]?.trim() ||
      `Group ${idx + 1}`

    const resolvedCategory =
      group.category?.trim() || group.product?.trim() || resolvedTitle

    const baseMeta = {
      ...group,
      title: group.title?.toLowerCase().startsWith("untitled group")
        ? resolvedTitle
        : group.title || resolvedTitle,
      category: group.category?.toLowerCase().startsWith("untitled group")
        ? resolvedCategory
        : group.category || resolvedCategory,
      specs_headers,
      description: group.description || "",
    }

    variants.forEach((variant) => {
      flat.push({ variant, groupMeta: baseMeta })
    })
  })

  const safeStr = (v: unknown) =>
    typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : ""

  const hasText = (v: unknown) => typeof v === "string" && v.trim().length > 0
  const isNum = (v: unknown) => typeof v === "number" && Number.isFinite(v)

  const getCode = (v: any) => getField(v, codeKeys())
  const getPriceNum = (v: any) => {
    const raw = getField(v, priceKeys())
    if (raw === null || raw === undefined || raw === "") return null
    const n = Number(String(raw).replace(/[^\d.]/g, ""))
    return Number.isFinite(n) ? n : null
  }

  const q = (searchQuery || "").toLowerCase()
  const filtered = flat.filter(({ variant, groupMeta }) => {
    if (!q) return true
    const hay =
      Object.values(variant).map((v) => String(v).toLowerCase()).join(" ") +
      " " +
      groupMeta.title.toLowerCase() +
      " " +
      groupMeta.category.toLowerCase() +
      " " +
      (groupMeta.description || "").toLowerCase()
    return hay.includes(q)
  })

  const paginated = filtered.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  )

  // Determine which spec columns have at least one real value on this page
  const displaySpecs = new Set<string>()
  paginated.forEach(({ variant, groupMeta }) => {
    groupMeta.specs_headers.forEach((header: string) => {
      const nk = normalizeKey(header)
      // skip code/price columns (handled separately)
      if (
        codeKeys().some((k) => nk === normalizeKey(k)) ||
        priceKeys().some((k) => nk === normalizeKey(k))
      )
        return
      const val =
        variant[header] ??
        variant[nk] ??
        (header in variant ? variant[header] : undefined)
      if (isNum(val) || hasText(val)) {
        displaySpecs.add(header)
      }
    })
  })

  // Show columns only if at least one row has a value
  const showCode = paginated.some(({ variant }) => hasText(getCode(variant)))
  // Treat price "present" when a finite number >= 0 exists; render only > 0
  const showPrice = paginated.some(
    ({ variant }) => getPriceNum(variant) !== null
  )

  // Build grouped map
  const map: Record<string, any> = {}
  paginated.forEach(({ variant, groupMeta }) => {
    const key = `${groupMeta.category}-${groupMeta.title}`
    if (!map[key]) map[key] = { ...groupMeta, variants: [] }

    const row: Record<string, any> = {}

    if (showCode) {
      const codeVal = getCode(variant)
      row["Product Code"] = hasText(codeVal) ? codeVal : "—"
    }

    ;[...displaySpecs].forEach((header) => {
      const nk = normalizeKey(header)
      const v =
        variant[header] ??
        variant[nk] ??
        (header in variant ? variant[header] : undefined)
      // keep numeric 0, trim strings, fallback to "—"
      row[header] = isNum(v) ? v : hasText(v) ? safeStr(v) : "—"
    })

    if (showPrice) {
      const priceVal = getPriceNum(variant)
      // render only when > 0, else show "—"
      row["Price"] = priceVal !== null && priceVal > 0 ? priceVal : "—"
    }

    map[key].variants.push(row)
  })

  // Post-process: drop empty rows and empty sections, prune dead headers
  grouped = Object.values(map)
    .map((group: any) => {
      // headers *before* pruning-by-rows
      const initialHeaders: string[] = []
      if (showCode) initialHeaders.push("Product Code")
      initialHeaders.push(...[...displaySpecs])
      if (showPrice) initialHeaders.push("Price")

      // keep a row if ANY header has a real value (number OR non-empty string != "—")
      const rows = (group.variants || []).filter((r: Record<string, any>) =>
        initialHeaders.some((h) => {
          const v = r[h]
          if (v === null || v === undefined) return false
          if (typeof v === "number") return Number.isFinite(v) && v > 0
          const s = String(v).trim()
          return s.length > 0 && s !== "—"
        })
      )

      // if no rows remain, this section is empty
      if (rows.length === 0) return null

      // prune headers that are completely empty across remaining rows
      const prunedHeaders = initialHeaders.filter((h) =>
        rows.some((r) => {
          const v = r[h]
          if (v === null || v === undefined) return false
          if (typeof v === "number") return Number.isFinite(v) && (h === "Price" ? v > 0 : true)
          const s = String(v).trim()
          return s.length > 0 && s !== "—"
        })
      )

      // if headers vanish entirely, drop the section
      if (prunedHeaders.length === 0) return null

      return { ...group, variants: rows, _tableHeaders: prunedHeaders }
    })
    .filter(Boolean) as any[]
}


  // --- Qualigens ---
  else if (brandKey === "qualigens") {
    let qualigensProducts = [];
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
        _tableHeaders: [
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

  // --- Rankem ---
  else if (brandKey === "rankem") {
    const flat = [];
    rankemProducts.forEach((group) => {
      const variants = group.variants || [];
      variants.forEach((v) => flat.push({ variant: v, groupMeta: group }));
    });
    const filtered = flat.filter(
      ({ variant, groupMeta }) =>
        Object.values(variant).some((v) =>
          String(v).toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        groupMeta.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const paginated = filtered.slice(
      (page - 1) * productsPerPage,
      page * productsPerPage
    );
    const map = {};
    paginated.forEach(({ variant, groupMeta }) => {
      const key = `${groupMeta.category}-${groupMeta.title}`;
      if (!map[key]) map[key] = { ...groupMeta, variants: [] };
      map[key].variants.push(variant);
    });
    grouped = Object.values(map);
    grouped.forEach((group) => {
      if (group.variants.length) {
        group._tableHeaders = Object.keys(group.variants[0]);
      }
    });
  }

  const handleAdd = (row, group) => {
    if (!isLoaded)
      return toast({
        title: "Loading...",
        description: "Please wait",
        variant: "destructive",
      });
    const price = Number(row["Price"]);
    if (typeof price !== "number" || price <= 0)
      return toast({
        title: "Invalid Price",
        description: "Cannot add invalid price.",
        variant: "destructive",
      });
    const name = row["Product Name"] || group.title;
    const catNo = row["Product Code"] || row.Code || "";
    addItem({
      id: `${brandKey}-${catNo}`,
      name,
      productName: name,
      catNo,
      productCode: catNo,
      casNo: row["CAS No"] || "",
      packSize: row["Pack Size"] || "",
      packing: row.Packing || "",
      hsn: row["HSN Code"] || "",
      price,
      quantity: 1,
      brand: brand.name,
      category: group.category,
      image: null,
    });
    toast({
      title: "Added to Cart",
      description: `${name} added.`,
      variant: "default",
    });
  };

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
                    {group._tableHeaders.map((h, i) => (
                      <th key={i} className="px-3 py-2">
                        {h}
                      </th>
                    ))}
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {group.variants.map((row, ri) => (
                    <tr key={`row-${gi}-${ri}`} className="border-t">
                      {group._tableHeaders.map((h, ci) => (
                        <td key={ci} className="px-3 py-2">
                          {row[h] || "—"}
                        </td>
                      ))}
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
          <p className="text-gray-500">
            No products found matching your search.
          </p>
        </div>
      )}
    </div>
  );
}
