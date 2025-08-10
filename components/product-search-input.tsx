"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

export type SearchProduct = {
  productName: string;
  code: string;
  brand: string;
  packSize: string;
  price?: number;
  hsnCode?: string;
};

type Props = {
  products: SearchProduct[];
  value: string;
  onChange: (text: string) => void;
  onSelect: (p: SearchProduct) => void;
  placeholder?: string;
  maxResults?: number;
  className?: string;
};

export default function ProductSearchInput({
  products,
  value,
  onChange,
  onSelect,
  placeholder = "Search…",
  maxResults = 50,
  className,
}: Props) {
  const [filtered, setFiltered] = useState<SearchProduct[]>([]);
  const [highlight, setHighlight] = useState<number>(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFiltered([]);
        setHighlight(-1);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Filter whenever value changes
  useEffect(() => {
    const q = value.trim().toLowerCase();
    if (!q) {
      setFiltered([]);
      setHighlight(-1);
      return;
    }
    const res = products.filter((p) =>
      `${p.productName} ${p.code} ${p.packSize}`.toLowerCase().includes(q)
    );
    setFiltered(res);
    setHighlight(res.length ? 0 : -1);
  }, [value, products]);

  const select = (p: SearchProduct) => {
    onSelect(p);
    // clear dropdown
    setFiltered([]);
    setHighlight(-1);
  };

  return (
    <div className={`relative ${className || ""}`} ref={containerRef}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (!filtered.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => {
              const next = Math.min(h + 1, filtered.length - 1);
              const el = listRef.current?.querySelectorAll("[data-opt]")[next] as HTMLElement | undefined;
              el?.scrollIntoView({ block: "nearest" });
              return next;
            });
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => {
              const next = Math.max(h - 1, 0);
              const el = listRef.current?.querySelectorAll("[data-opt]")[next] as HTMLElement | undefined;
              el?.scrollIntoView({ block: "nearest" });
              return next;
            });
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (highlight >= 0) select(filtered[highlight]);
          } else if (e.key === "Escape") {
            setFiltered([]);
            setHighlight(-1);
          }
        }}
        aria-expanded={filtered.length > 0}
        aria-activedescendant={highlight >= 0 ? `opt-${highlight}` : undefined}
      />

      {filtered.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-10 bg-white shadow border mt-1 w-full max-h-64 overflow-y-auto text-sm"
          role="listbox"
        >
          {filtered.slice(0, maxResults).map((p, idx) => {
            const active = idx === highlight;
            return (
              <div
                key={`${p.code}-${idx}`}
                id={`opt-${idx}`}
                data-opt
                role="option"
                aria-selected={active}
                className={`px-2 py-1 cursor-pointer ${active ? "bg-gray-200" : "hover:bg-gray-100"}`}
                onMouseEnter={() => setHighlight(idx)}
                onMouseDown={(e) => e.preventDefault()} // keep input focused
                onClick={() => select(p)}
              >
                <span className="font-medium">{p.productName}</span>{" "}
                <span className="text-xs text-muted-foreground">
                  [Code: {p.code}] • [Size: {p.packSize}]
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
