import { Hero } from "@/components/hero";
import { ImageGrid } from "@/components/image-grid";
import { Pricing } from "@/components/pricing";
import { Testimonials } from "@/components/testimonials";
import { FAQ } from "@/components/faq";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ImageGrid />
      <Pricing />
      <Testimonials />
      <FAQ />
    </>
  );
}
