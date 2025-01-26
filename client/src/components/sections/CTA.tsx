import React from 'react';
import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <section className="bg-white flex w-full flex-col overflow-hidden items-center justify-center px-16 py-28 max-md:max-w-full max-md:px-5 max-md:py-[100px]">
      <div className="flex w-[768px] max-w-full flex-col items-stretch">
        <div className="w-full text-black text-center max-md:max-w-full">
          <h2 className="text-5xl font-bold leading-[1.2] max-md:max-w-full max-md:text-[40px]">
            Transform Your Search Today
          </h2>
          <p className="text-lg font-normal leading-[27px] mt-6 max-md:max-w-full">
            Sign up now to revolutionize your search experience and unlock
            powerful features at your fingertips.
          </p>
        </div>
        <div className="self-center flex gap-4 text-base font-normal mt-8">
          <Button className="bg-black text-white border-black hover:bg-white hover:text-black transition-colors">
            Sign Up
          </Button>
          <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white transition-colors">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;