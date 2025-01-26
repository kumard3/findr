export function ImageGrid() {
  return (
    <section className="container py-24">
      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={`col1-${i}`}
              className="aspect-[3/4] w-full rounded-lg bg-muted"
            />
          ))}
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={`col2-${i}`}
              className="aspect-[4/3] w-full rounded-lg bg-muted"
            />
          ))}
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={`col3-${i}`}
              className="aspect-[3/4] w-full rounded-lg bg-muted"
            />
          ))}
        </div>
      </div>
    </section>
  );
}