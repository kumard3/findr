import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const NavItems = () => (
    <>
      <NavigationMenuItem>
        <Link
          href="/"
          className="hover:text-gray-600 transition-colors px-4 py-2"
        >
          Home Page
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <Link
          href="/about"
          className="hover:text-gray-600 transition-colors px-4 py-2"
        >
          About Us
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <Link
          href="/services"
          className="hover:text-gray-600 transition-colors px-4 py-2"
        >
          Services
        </Link>
      </NavigationMenuItem>
    </>
  );

  const AuthButtons = () => (
    <div className="flex items-center gap-4 justify-center">
      <Link href={"/auth/signup"}>
        <Button
          variant="outline"
          className="border-black text-black hover:bg-black hover:text-white transition-colors"
        >
          Join
        </Button>
      </Link>
      <Link href={"/auth/login"}>
        <Button className="bg-black text-white border-black hover:bg-white hover:text-black transition-colors">
          Sign Up
        </Button>
      </Link>
    </div>
  );

  return (
    <nav className="bg-white border-b flex min-h-[72px] w-full flex-col items-stretch justify-center px-4 md:px-16 sticky top-0 z-50">
      <div className="flex w-full items-center justify-between flex-wrap gap-4">
        <div className="flex min-h-10 items-center justify-center w-20">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/95eacc6d9a06ee728f440111cb48ce533ebe6f2f94daa48b9350854515cb14f6?placeholderIfAbsent=true"
            className="aspect-[2.33] object-contain w-[84px]"
            alt="Findr Logo"
          />
        </div>

        {!isMobile ? (
          <div className="flex items-center gap-8 text-base font-normal justify-center flex-wrap">
            <AuthButtons />
          </div>
        ) : (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white transition-colors p-2"
                onClick={() => setIsOpen(true)}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-8 mt-8">
                <div className="flex flex-col gap-4">
                  <AuthButtons />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
