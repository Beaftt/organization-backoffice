import { ModuleCard } from '../cards/ModuleCard';
import type { DashboardModule } from '../../types';

interface DashboardModulesGridProps {
  modules: DashboardModule[];
  title: string;
}

export function DashboardModulesGrid({ modules, title }: DashboardModulesGridProps) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]/40">
        {title}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <div key={module.key} className="list-item-animate">
            <ModuleCard module={module} />
          </div>
        ))}
      </div>
    </section>
  );
}
