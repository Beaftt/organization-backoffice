import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const plans = [
  {
    key: "starter",
    name: "Starter",
    price: "R$ 0",
    description: "Para uso pessoal e times pequenos.",
    features: ["1 workspace", "Limite básico de compartilhamento"],
  },
  {
    key: "pro",
    name: "Pro",
    price: "R$ 49/mês",
    description: "Para times em crescimento.",
    features: ["Workspaces ilimitados", "Mais membros", "Suporte prioritário"],
  },
  {
    key: "business",
    name: "Business",
    price: "R$ 149/mês",
    description: "Para empresas e times avançados.",
    features: ["SLA dedicado", "Entitlements avançados", "Auditoria"],
  },
];

export default function PlansPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-semibold">Planos</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Escolha o plano ideal para seu workspace.
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.key}>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  {plan.name}
                </p>
                <p className="mt-1 text-2xl font-semibold">{plan.price}</p>
                <p className="mt-2 text-sm text-zinc-600">
                  {plan.description}
                </p>
              </div>
              <ul className="flex flex-col gap-2 text-sm text-zinc-600">
                {plan.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <Button className="mt-4">
                {plan.key === "starter" ? "Plano atual" : "Fazer upgrade"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
