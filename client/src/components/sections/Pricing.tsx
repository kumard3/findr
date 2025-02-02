import React from "react";
import { Button } from "@/components/ui/button";
import { PricingTable } from "../pricing";

const Pricing = () => {
  return (
    <section className="bg-white flex w-full flex-col overflow-hidden items-stretch justify-center px-16 py-28 max-md:max-w-full max-md:px-5 max-md:py-[100px]">
      <div className="flex w-full items-center gap-[40px_80px] flex-wrap max-md:max-w-full">
        <div className="self-stretch flex min-w-60 flex-col items-stretch flex-1 shrink basis-[0%] my-auto max-md:max-w-full">
          <div className="w-full text-black max-md:max-w-full">
            <div className="flex w-full flex-col items-stretch max-md:max-w-full">
              <span className="text-base font-semibold">Affordable</span>
              <div className="w-full mt-4 max-md:max-w-full">
                <h2 className="text-5xl font-bold leading-[58px] max-md:max-w-full max-md:text-[40px] max-md:leading-[54px]">
                  Cost-Effective Solutions for Every Business
                </h2>
                <p className="text-lg font-normal leading-[27px] mt-6 max-md:max-w-full">
                  At Findr, we believe that powerful search capabilities
                  shouldn't break the bank. Our platform offers exceptional
                  value without sacrificing quality.
                </p>
              </div>
            </div>
            <div className="w-full mt-8 max-md:max-w-full">
              <div className="flex w-full gap-6 flex-wrap py-2 max-md:max-w-full">
                <div className="min-w-60 flex-1 shrink basis-[0%]">
                  <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/fa6119d5f81204fe6d3516d96540d57df07aacd17aae3a163ee6969b8454b114?placeholderIfAbsent=true"
                    className="aspect-[1] object-contain w-12"
                    alt="Pricing feature 1"
                  />
                  <h3 className="text-xl font-bold leading-[1.4] mt-4">
                    Unmatched Pricing
                  </h3>
                  <p className="text-base font-normal leading-6 mt-4">
                    Get the best search technology at a price that fits your
                    budget.
                  </p>
                </div>
                <div className="min-w-60 flex-1 shrink basis-[0%]">
                  <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/fa6119d5f81204fe6d3516d96540d57df07aacd17aae3a163ee6969b8454b114?placeholderIfAbsent=true"
                    className="aspect-[1] object-contain w-12"
                    alt="Pricing feature 2"
                  />
                  <h3 className="text-xl font-bold leading-[1.4] mt-4">
                    Easy Integration
                  </h3>
                  <p className="text-base font-normal leading-6 mt-4">
                    Seamlessly integrate our API into your existing systems for
                    effortless implementation.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 text-base text-black font-normal mt-8">
            <Button
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white transition-colors"
            >
              Learn More
            </Button>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <span>Sign Up</span>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/ab0adb4029351d80b7e7b25f9140c1b51b084c00d1783480141a01b4d0e87deb?placeholderIfAbsent=true"
                className="aspect-[1] object-contain w-6"
                alt="Arrow right"
              />
            </div>
          </div>
        </div>
        <img
          loading="lazy"
          srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/695e35fe9375ed813e9267c48b6e6e0ed2c5303c0a4eb46842040dcb8370ac1e?placeholderIfAbsent=true&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/695e35fe9375ed813e9267c48b6e6e0ed2c5303c0a4eb46842040dcb8370ac1e?placeholderIfAbsent=true&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/695e35fe9375ed813e9267c48b6e6e0ed2c5303c0a4eb46842040dcb8370ac1e?placeholderIfAbsent=true&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/695e35fe9375ed813e9267c48b6e6e0ed2c5303c0a4eb46842040dcb8370ac1e?placeholderIfAbsent=true&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/695e35fe9375ed813e9267c48b6e6e0ed2c5303c0a4eb46842040dcb8370ac1e?placeholderIfAbsent=true&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/695e35fe9375ed813e9267c48b6e6e0ed2c5303c0a4eb46842040dcb8370ac1e?placeholderIfAbsent=true&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/695e35fe9375ed813e9267c48b6e6e0ed2c5303c0a4eb46842040dcb8370ac1e?placeholderIfAbsent=true&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/695e35fe9375ed813e9267c48b6e6e0ed2c5303c0a4eb46842040dcb8370ac1e?placeholderIfAbsent=true"
          className="aspect-[0.96] object-contain w-full self-stretch min-w-60 flex-1 shrink basis-[0%] my-auto max-md:max-w-full"
          alt="Pricing illustration"
        />
      </div>
      <PricingTable />
    </section>
  );
};

export default Pricing;
