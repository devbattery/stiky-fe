import Link from 'next/link';
import type { TrendingUser } from '@/lib/types';
import { Avatar } from '@/components/ui/avatar';

export function TrendingUserCard({ user }: { user: TrendingUser }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-4">
      <Avatar src={user.profile_image_url ?? undefined} alt={user.nickname ?? '사용자'} />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground">{user.nickname ?? '익명'}</span>
        {user.blog && (
          <Link href={`/${user.blog.slug}`} className="text-xs text-muted-foreground hover:underline">
            {user.blog.name}
          </Link>
        )}
      </div>
    </div>
  );
}
