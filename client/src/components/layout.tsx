import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className="relative min-h-screen mx-auto">
      <Nav />
      <main className={cn("flex-1 container mx-auto", className)}>{children}</main>
      <Footer />
    </div>
  );
}