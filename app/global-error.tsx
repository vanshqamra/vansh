"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  console.error("[global] client error:", error);
  return (
    <html>
      <body>
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-2xl font-bold mb-2">App Error</h1>
          <pre className="text-xs bg-red-50 border border-red-200 p-3 rounded overflow-auto">
            {String(error?.stack || error?.message || error)}
          </pre>
          <button
            onClick={() => reset()}
            className="mt-4 px-4 py-2 rounded border border-slate-300 hover:bg-slate-50"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
