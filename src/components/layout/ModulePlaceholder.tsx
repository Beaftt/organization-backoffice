import { Card } from "@/components/ui/Card";

export function ModulePlaceholder({ title }: { title: string }) {
  return (
    <Card>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Este módulo será implementado conforme o checklist.
      </p>
    </Card>
  );
}
