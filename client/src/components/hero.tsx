import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="container py-24">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            Medium length hero heading goes here
          </h1>
          <p className="text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            varius enim in eros elementum tristique. Duis cursus, mi quis viverra
            ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.
          </p>
          <div className="flex gap-4">
            <Button>Button</Button>
            <Button variant="outline">Button</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="aspect-square w-full rounded-lg bg-muted"
              aria-label="Placeholder image"
            />
          ))}
        </div>
      </div>
    </section>
  );
}