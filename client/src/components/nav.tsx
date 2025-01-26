import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Logo
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link href="#" className="text-sm hover:text-foreground/80">
            Link One
          </Link>
          <Link href="#" className="text-sm hover:text-foreground/80">
            Link Two
          </Link>
          <Link href="#" className="text-sm hover:text-foreground/80">
            Link Three
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm hover:text-foreground/80">
              Link Four <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Link Five</DropdownMenuItem>
              <DropdownMenuItem>Link Six</DropdownMenuItem>
              <DropdownMenuItem>Link Seven</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline">Button</Button>
          <Button>Button</Button>
        </nav>
      </div>
    </header>
  );
}