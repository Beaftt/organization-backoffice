export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
        <div className="relative grid w-full overflow-hidden rounded-[32px] bg-[var(--surface)] shadow-[0_20px_60px_rgba(22,26,40,0.12)] lg:grid-cols-[0.85fr_1.15fr]">
          <div className="hidden flex-col justify-between bg-[var(--sidebar)] p-10 text-[var(--sidebar-text)] lg:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-lg font-semibold">
                OP
              </div>
              <div>
                <p className="text-base font-semibold">Organization</p>
                <p className="text-sm text-white/70">Backoffice</p>
              </div>
            </div>
            <div className="mt-16">
              <h1 className="text-3xl font-semibold leading-tight">
                Centralize módulos, permissões e automações em um só lugar.
              </h1>
              <p className="mt-4 text-sm text-white/80">
                Faça login para acessar seus workspaces com segurança.
              </p>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 text-xs text-white/80">
              Segurança, organização e produtividade.
            </div>
          </div>
          <div className="flex items-center justify-center px-6 py-10 sm:px-10">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
