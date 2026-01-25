import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  return (
    <Card className="max-w-2xl">
      <h2 className="text-lg font-semibold">Perfil</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Atualize sua foto, nome e informações básicas.
      </p>
      <div className="mt-6 flex flex-col gap-4">
        <Input label="Nome" placeholder="Seu nome" />
        <Input label="Foto (URL)" placeholder="https://" />
      </div>
      <Button className="mt-6">Salvar</Button>
    </Card>
  );
}
