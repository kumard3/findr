import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionProps {
  title: string;
  description: string;
  imagePosition?: "left" | "right";
  label?: string;
  actions?: ReactNode[];
}

export function Section({
  title,
  description,
  imagePosition = "right",
  label,
  actions,
}: SectionProps) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        <div
          className={cn(
            "space-y-6",
            imagePosition === "right" ? "order-1" : "order-2 md:order-1"
          )}
        >
          {label && (
            <span className="text-sm font-medium text-gray-600">{label}</span>
          )}
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="text-gray-600">{description}</p>
          {actions && <div className="flex gap-4">{actions}</div>}
        </div>
        <div
          className={cn(
            "bg-gray-200 rounded-lg h-[300px]",
            imagePosition === "right" ? "order-2" : "order-1 md:order-2"
          )}
        />
      </div>
    </section>
  );
}
