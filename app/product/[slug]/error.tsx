// app/product/[slug]/error.tsx
"use client";
export default function Error({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="container mx-auto px-4 py-10 text-red-700">
      <h1 className="text-xl font-bold mb-2">Product page error</h1>
      <p className="mb-2">Digest: {error?.digest || "n/a"}</p>
      <p className="text-sm opacity-80">Check server logs with this digest to see the full stack.</p>
    </div>
  );
}
