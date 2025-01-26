import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-white w-full px-16 py-20 max-md:max-w-full max-md:px-5">
      <div className="flex w-full gap-[40px_100px] justify-between flex-wrap max-md:max-w-full">
        <div className="min-w-60 w-[493px] max-md:max-w-full">
          <div className="w-[84px] overflow-hidden">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/6636bc741769f2c196a9a7fce3e26c27a13dfd2bd436d03d11aa2de1fcc2cee2?placeholderIfAbsent=true"
              className="aspect-[2.33] object-contain w-full"
              alt="Findr logo"
            />
          </div>
          <nav className="flex max-w-full w-[493px] gap-8 text-sm text-black font-semibold flex-wrap mt-8">
            <a href="/about" className="hover:opacity-80 transition-opacity">
              About Us
            </a>
            <a href="/contact" className="hover:opacity-80 transition-opacity">
              Contact Us
            </a>
            <a href="/services" className="hover:opacity-80 transition-opacity">
              Our Services
            </a>
            <a href="/blog" className="hover:opacity-80 transition-opacity">
              Blog Posts
            </a>
            <a href="/faq" className="hover:opacity-80 transition-opacity">
              FAQs
            </a>
          </nav>
        </div>
        <div className="min-w-60 w-[400px]">
          <h3 className="text-black text-base font-semibold">Join</h3>
          <div className="w-full font-normal mt-4">
            <form className="flex min-h-12 w-full gap-4 text-base">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 border-black"
              />
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white transition-colors"
              >
                Join
              </Button>
            </form>
            <p className="flex min-h-[18px] w-full gap-1 text-xs mt-3">
              <span className="text-black">
                By subscribing you agree to our
              </span>
              <a
                href="/privacy"
                className="text-black underline hover:opacity-80 transition-opacity"
              >
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="w-full text-sm font-normal mt-20 max-md:max-w-full max-md:mt-10">
        <div className="bg-black border flex min-h-px w-full border-black border-solid max-md:max-w-full" />
        <div className="flex w-full gap-[40px_100px] justify-between flex-wrap mt-8 max-md:max-w-full">
          <div className="flex min-w-60 gap-6 text-black">
            <a
              href="/privacy"
              className="underline hover:opacity-80 transition-opacity"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="underline hover:opacity-80 transition-opacity"
            >
              Terms of Service
            </a>
            <a
              href="/cookies"
              className="underline hover:opacity-80 transition-opacity"
            >
              Cookie Settings
            </a>
          </div>
          <div className="text-black">© 2024 Findr. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
