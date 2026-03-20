'use client';

type Props = {
  noListsTitle: string;
  noListsSubtitle: string;
};

export function ListSidebarEmpty({ noListsTitle, noListsSubtitle }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1 px-4 py-8 text-center">
      <p className="text-sm font-medium text-zinc-500">{noListsTitle}</p>
      <p className="text-xs text-zinc-400">{noListsSubtitle}</p>
    </div>
  );
}
