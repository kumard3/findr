const testimonials = [
  {
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare.",
    author: "Name Surname",
    position: "Position, Company name",
  },
  {
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare.",
    author: "Name Surname",
    position: "Position, Company name",
  },
  {
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare.",
    author: "Name Surname",
    position: "Position, Company name",
  },
];

export function Testimonials() {
  return (
    <section className="container py-24">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold">Customer testimonials</h2>
        <p className="mt-4 text-muted-foreground">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {testimonials.map((testimonial, i) => (
          <div key={i} className="space-y-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 text-primary"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
            </div>
            <blockquote className="text-lg">"{testimonial.quote}"</blockquote>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div>
                <div className="font-medium">{testimonial.author}</div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.position}
                </div>
              </div>
            </div>
            <div className="h-5 w-24 bg-muted" />
          </div>
        ))}
      </div>
    </section>
  );
}