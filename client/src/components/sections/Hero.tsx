import React from 'react';
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="bg-white flex w-full flex-col-reverse md:flex-row items-center gap-8 md:gap-[40px_80px] overflow-hidden px-4 md:px-16 py-16 md:py-28">
      <div className="self-stretch flex min-w-60 flex-col items-stretch flex-1 shrink basis-[0%] my-auto max-w-full">
        <div className="w-full text-black">
          <h1 className="text-4xl md:text-[56px] font-bold leading-tight md:leading-[67px]">
            Unlock the Power of Semantic Search
          </h1>
          <p className="text-lg font-normal leading-[27px] mt-6">
            Discover how Findr can transform your search experience. Our
            platform makes it easy to find exactly what you need, quickly and
            efficiently.
          </p>
        </div>
        <div className="flex gap-4 text-base font-normal mt-8">
          <Button className="bg-black text-white border-black hover:bg-white hover:text-black transition-colors">
            Get Started
          </Button>
          <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white transition-colors">
            Learn More
          </Button>
        </div>
      </div>
      <img
        loading="lazy"
        srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/30e7c37ae593096118d857c33cc472ae44ad44dd24fedf1e9c488fe4bae83a45?placeholderIfAbsent=true&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/30e7c37ae593096118d857c33cc472ae44ad44dd24fedf1e9c488fe4bae83a45?placeholderIfAbsent=true&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/30e7c37ae593096118d857c33cc472ae44ad44dd24fedf1e9c488fe4bae83a45?placeholderIfAbsent=true&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/30e7c37ae593096118d857c33cc472ae44ad44dd24fedf1e9c488fe4bae83a45?placeholderIfAbsent=true&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/30e7c37ae593096118d857c33cc472ae44ad44dd24fedf1e9c488fe4bae83a45?placeholderIfAbsent=true&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/30e7c37ae593096118d857c33cc472ae44ad44dd24fedf1e9c488fe4bae83a45?placeholderIfAbsent=true&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/30e7c37ae593096118d857c33cc472ae44ad44dd24fedf1e9c488fe4bae83a45?placeholderIfAbsent=true&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/30e7c37ae593096118d857c33cc472ae44ad44dd24fedf1e9c488fe4bae83a45?placeholderIfAbsent=true"
        className="aspect-[0.96] object-contain w-full max-w-[500px] md:max-w-none self-stretch min-w-60 flex-1 shrink basis-[0%] my-auto"
        alt="Hero illustration"
      />
    </section>
  );
};

export default Hero;