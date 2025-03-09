import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "1,000 documents",
      "100 searches per day",
      "1 API key",
      "1 collection",
      "Basic support",
    ],
    tierId: "free",
  },
  {
    name: "Pro",
    price: "$29",
    description: "For growing businesses",
    features: [
      "10,000 documents",
      "1,000 searches per day",
      "5 API keys",
      "5 collections",
      "Priority support",
      "Advanced analytics",
      "Custom integration",
    ],
    tierId: "pro",
  },
];

export function PricingTable() {
  const router = useRouter();
  const { data: session } = useSession();
  const activateTier = api.tier.activate.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  return (
    <section className="container py-24">
      <div className="text-center">
        <h4 className="text-sm font-medium">Tagline</h4>
        <h2 className="mt-2 text-3xl font-bold">Pricing plan</h2>
        <p className="mt-4 text-muted-foreground">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center rounded-full border p-1">
          <Button variant="outline" className="rounded-full">
            Monthly
          </Button>
          <Button variant="ghost" className="rounded-full">
            Yearly
          </Button>
        </div>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-lg border p-8">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <div className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <p className="mt-2 text-muted-foreground">{plan.description}</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <p className="text-sm font-medium">Includes:</p>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              className="mt-8 w-full"
              onClick={() => {
                if (!session) {
                  router.push("/auth/signin");
                  return;
                }
                activateTier.mutate({ tierId: plan.tierId });
              }}
            >
              {session ? "Get started" : "Sign in to start"}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
