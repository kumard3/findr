import React from 'react';

const Features = () => {
  return (
    <section className="bg-white w-full overflow-hidden px-16 py-28 max-md:max-w-full max-md:px-5 max-md:py-[100px]">
      <h2 className="text-black text-[40px] font-bold leading-[48px] max-md:max-w-full">
        Unlock the Power of Search with Findr's Innovative Platform
      </h2>
      <div className="w-full mt-20 max-md:max-w-full max-md:mt-10">
        <div className="flex w-full gap-[40px_48px] justify-center flex-wrap max-md:max-w-full">
          <div className="min-w-60 flex-1 shrink basis-[0%]">
            <div className="w-full text-black">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/fa6119d5f81204fe6d3516d96540d57df07aacd17aae3a163ee6969b8454b114?placeholderIfAbsent=true"
                className="aspect-[1] object-contain w-12"
                alt="Feature icon 1"
              />
              <h3 className="text-2xl font-bold leading-[34px] mt-6">
                Transform Your User Experience with Seamless Integration
              </h3>
              <p className="text-base font-normal leading-6 mt-6">
                Leverage Findr's search platform to enhance your application
                and boost engagement.
              </p>
            </div>
            <div className="flex w-full flex-col text-base text-black font-normal mt-8">
              <div className="flex items-center gap-2 overflow-hidden justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <span>Learn More</span>
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/ab0adb4029351d80b7e7b25f9140c1b51b084c00d1783480141a01b4d0e87deb?placeholderIfAbsent=true"
                  className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
                  alt="Arrow right"
                />
              </div>
            </div>
          </div>
          {/* Similar feature blocks for other features */}
          <div className="min-w-60 flex-1 shrink basis-[0%]">
            <div className="w-full text-black">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/c31a01859bf214634e2c6e8f9aeb971ffe2e1b86117b637dcc36f56ea74e81fd?placeholderIfAbsent=true"
                className="aspect-[1] object-contain w-12"
                alt="Feature icon 2"
              />
              <h3 className="text-2xl font-bold leading-[34px] mt-6">
                Simple Steps to Get Started with Findr's API
              </h3>
              <p className="text-base font-normal leading-6 mt-6">
                Follow these easy steps to integrate and customize your search
                experience.
              </p>
            </div>
            <div className="flex w-full flex-col text-base text-black font-normal mt-8">
              <div className="flex items-center gap-2 overflow-hidden justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <span>Sign Up</span>
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/3b8cf3e76c774156e3d593733ae41851872418e5498573beca1a82e10a0acbbc?placeholderIfAbsent=true"
                  className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
                  alt="Arrow right"
                />
              </div>
            </div>
          </div>
          <div className="min-w-60 flex-1 shrink basis-[0%]">
            <div className="w-full text-black">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/9b7aef7a56dc237d2313b94b0505f6d47323084275498f493291c948abfbad3c?placeholderIfAbsent=true"
                className="aspect-[1] object-contain w-12"
                alt="Feature icon 3"
              />
              <h3 className="text-2xl font-bold leading-[34px] mt-6">
                Achieve Accurate Results with Tailored Search Configurations
              </h3>
              <p className="text-base font-normal leading-6 mt-6">
                Get precise search results that meet your users' needs
                effortlessly.
              </p>
            </div>
            <div className="flex w-full flex-col text-base text-black font-normal mt-8">
              <div className="flex items-center gap-2 overflow-hidden justify-center cursor-pointer hover:opacity-80 transition-opacity">
                <span>Get Started</span>
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/485025b48296a88b1239533c02d30c5c7ca91522771302faa7b16aa4376cf138?placeholderIfAbsent=true"
                  className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
                  alt="Arrow right"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;