import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Blog = () => {
  return (
    <section className="bg-white w-full overflow-hidden text-black px-16 py-28 max-md:max-w-full max-md:px-5 max-md:py-[100px]">
      <div className="flex w-[768px] max-w-full flex-col items-stretch">
        <span className="text-base font-semibold">Blog</span>
        <div className="w-full mt-4 max-md:max-w-full">
          <h2 className="text-5xl font-bold leading-[1.2] max-md:max-w-full max-md:text-[40px]">
            Latest Insights and Updates
          </h2>
          <p className="text-lg font-normal mt-6 max-md:max-w-full">
            Explore our recent articles for valuable insights.
          </p>
        </div>
      </div>
      <div className="w-full mt-20 max-md:max-w-full max-md:mt-10">
        <div className="flex w-full gap-8 flex-wrap max-md:max-w-full">
          <Card className="min-w-60 flex-1 shrink basis-[0%]">
            <CardHeader className="p-0">
              <img
                loading="lazy"
                srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/c9e0cf3ae1faf31d1c2598b87adc392e64a4ccffcb0296d31704df874eb1a46a?placeholderIfAbsent=true&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/c9e0cf3ae1faf31d1c2598b87adc392e64a4ccffcb0296d31704df874eb1a46a?placeholderIfAbsent=true&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/c9e0cf3ae1faf31d1c2598b87adc392e64a4ccffcb0296d31704df874eb1a46a?placeholderIfAbsent=true&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/c9e0cf3ae1faf31d1c2598b87adc392e64a4ccffcb0296d31704df874eb1a46a?placeholderIfAbsent=true&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/c9e0cf3ae1faf31d1c2598b87adc392e64a4ccffcb0296d31704df874eb1a46a?placeholderIfAbsent=true&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/c9e0cf3ae1faf31d1c2598b87adc392e64a4ccffcb0296d31704df874eb1a46a?placeholderIfAbsent=true&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/c9e0cf3ae1faf31d1c2598b87adc392e64a4ccffcb0296d31704df874eb1a46a?placeholderIfAbsent=true&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/c9e0cf3ae1faf31d1c2598b87adc392e64a4ccffcb0296d31704df874eb1a46a?placeholderIfAbsent=true"
                className="aspect-[1.39] object-contain w-full"
                alt="Blog post 1"
              />
            </CardHeader>
            <CardContent className="mt-6">
              <span className="text-sm font-semibold">Technology</span>
              <CardTitle className="text-2xl font-bold leading-[1.4] mt-2">
                Maximizing Your Search Potential
              </CardTitle>
              <CardDescription className="text-base font-normal leading-6 mt-2">
                Discover how to enhance your search capabilities with our platform.
              </CardDescription>
            </CardContent>
            <CardFooter className="flex w-full items-center gap-4 text-sm mt-6">
              <img
                loading="lazy"
                srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/bb6a9d37f954ce0b3ab64f4f23bc2859ef965b103049e62ca338f449fba5e514?placeholderIfAbsent=true&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/bb6a9d37f954ce0b3ab64f4f23bc2859ef965b103049e62ca338f449fba5e514?placeholderIfAbsent=true&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/bb6a9d37f954ce0b3ab64f4f23bc2859ef965b103049e62ca338f449fba5e514?placeholderIfAbsent=true&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/bb6a9d37f954ce0b3ab64f4f23bc2859ef965b103049e62ca338f449fba5e514?placeholderIfAbsent=true&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/bb6a9d37f954ce0b3ab64f4f23bc2859ef965b103049e62ca338f449fba5e514?placeholderIfAbsent=true&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/bb6a9d37f954ce0b3ab64f4f23bc2859ef965b103049e62ca338f449fba5e514?placeholderIfAbsent=true&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/bb6a9d37f954ce0b3ab64f4f23bc2859ef965b103049e62ca338f449fba5e514?placeholderIfAbsent=true&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/bb6a9d37f954ce0b3ab64f4f23bc2859ef965b103049e62ca338f449fba5e514?placeholderIfAbsent=true"
                className="aspect-[1] object-contain w-12"
                alt="Author avatar"
              />
              <div className="flex-1">
                <div className="font-semibold">Jane Doe</div>
                <div className="flex items-center gap-2 font-normal">
                  <span>11 Jan 2022</span>
                  <span>•</span>
                  <span>5 min read</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      <div className="flex w-full flex-col text-base text-black font-normal mt-20 max-md:max-w-full max-md:mt-10">
        <Button 
          variant="outline" 
          className="w-[104px] border-black text-black hover:bg-black hover:text-white transition-colors"
        >
          View all
        </Button>
      </div>
    </section>
  );
};

export default Blog;