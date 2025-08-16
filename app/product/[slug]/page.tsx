// app/product/[slug]/page.tsx
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <div style={{ padding: 24, fontFamily: "ui-sans-serif" }}>
      OK — /product/{params.slug}
    </div>
  );
}
