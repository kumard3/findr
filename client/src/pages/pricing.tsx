import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

const tiers = [
  {
    name: "Free",
    price: 0,
    features: [
      "1,000 documents",
      "100 searches per day",
      "1 API key",
      "1 collection",
      "Basic support",
    ],
    documentLimit: 1000,
    storageLimit: 100 * 1024 * 1024, // 100MB
    searchesPerDay: 100,
    apiKeys: 1,
    collections: 1,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const activateTier = api.tier.activate.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-center text-4xl font-bold mb-8">
        Simple, transparent pricing
      </h1>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {tiers.map((tier) => (
          <Card key={tier.name} className="p-6">
            <h2 className="text-2xl font-bold mb-2">{tier.name}</h2>
            <p className="text-3xl font-bold mb-4">
              ${tier.price}
              <span className="text-lg font-normal">/month</span>
            </p>
            <ul className="space-y-2 mb-6">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              onClick={() => {
                if (!session) {
                  router.push("/auth/signin");
                  return;
                }
                activateTier.mutate({ tierId: tier.name.toLowerCase() });
              }}
            >
              {session ? "Get Started" : "Sign in to start"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
