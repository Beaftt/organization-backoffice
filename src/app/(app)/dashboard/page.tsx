import { Card } from "@/components/ui/Card";

export default function DashboardPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <h2 className="text-lg font-semibold">Resumo do workspace</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Centralize o acesso rápido aos módulos habilitados.
        </p>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Atividades recentes</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Eventos recentes aparecerão aqui.
        </p>
      </Card>
    </div>
  );
}
