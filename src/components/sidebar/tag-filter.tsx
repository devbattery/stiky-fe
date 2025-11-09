import Link from 'next/link';

export type TagFilterItem = {
  id: number;
  name: string;
  slug: string;
  count?: number | null;
  href: string;
};

export function TagFilter({
  items,
  active,
  allHref,
}: {
  items: TagFilterItem[];
  active?: string | null;
  allHref: string;
}) {
  return (
    <aside className="space-y-3 rounded-lg border border-border bg-background p-4">
      <h3 className="text-sm font-semibold text-foreground">태그</h3>
      <nav className="flex flex-col gap-2 text-sm">
        <Link
          href={allHref}
          className={`flex items-center justify-between rounded-md px-3 py-2 ${
            !active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <span>전체</span>
        </Link>
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center justify-between rounded-md px-3 py-2 ${
              active === item.slug ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <span>#{item.slug}</span>
            {item.count !== undefined && item.count !== null && (
              <span className="text-xs">{item.count}</span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
