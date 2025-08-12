import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-semibold mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-6">
        The page you’re looking for doesn’t exist or may have moved.
      </p>
      <Button asChild>
        <Link href="/">Go back home</Link>
      </Button>
    </div>
  );
}
