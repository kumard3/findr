import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto flex flex-col gap-8 px-4 py-10 md:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          {/* Logo and Navigation */}
          <div className="flex flex-col gap-8 md:flex-row md:gap-16">
            <div className="space-y-4">
              <Link href="/" className="text-xl font-bold">
                Logo
              </Link>
              <nav className="flex flex-col gap-2">
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Link One
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Link Two
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Link Three
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Link Four
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Link Five
                </Link>
              </nav>
            </div>
          </div>

          {/* Subscribe Form */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Subscribe</h3>
            <div className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="max-w-xs"
              />
              <Button className="w-fit">Subscribe</Button>
              <p className="text-xs text-muted-foreground">
                By subscribing you agree to with our{" "}
                <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Footer Bottom */}
        <div className="flex flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-foreground">
              Cookies Settings
            </Link>
          </div>
          <p>© 2024 Relume. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}