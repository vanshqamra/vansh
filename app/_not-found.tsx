export default function NotFoundPage() {
  try {
    return (
      <div className="h-screen flex items-center justify-center text-center">
        <div>
          <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
          <p className="text-muted-foreground mt-2">This page does not exist.</p>
        </div>
      </div>
    );
  } catch (err) {
    return <p>Error rendering _not-found page: {(err as Error).message}</p>;
  }
}
