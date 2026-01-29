export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[var(--sidebar)]/20 blur-[140px]" />
        <div className="absolute -bottom-48 left-10 h-[360px] w-[360px] rounded-full bg-[#ff8c42]/20 blur-[160px]" />
        <div className="absolute -bottom-24 right-10 h-[320px] w-[320px] rounded-full bg-[#7dd3fc]/20 blur-[140px]" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full rounded-[36px] border border-white/25 bg-white/10 p-2 shadow-[0_30px_80px_rgba(12,18,36,0.25)] backdrop-blur-2xl">
          <div className="rounded-[30px] border border-[var(--border)] bg-[var(--surface)]/90 px-6 py-10 text-[var(--foreground)] shadow-sm sm:px-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
