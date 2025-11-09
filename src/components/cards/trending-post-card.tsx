import Link from 'next/link';
import type { TrendingPost } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export function TrendingPostCard({ post }: { post: TrendingPost }) {
  const href = post.blog ? `/${post.blog.slug}/posts/${post.slug}` : `/posts/${post.slug}`;
  return (
    <article className="space-y-2 rounded-lg border border-border bg-background p-4">
      <Link href={href} className="text-base font-semibold text-foreground hover:underline">
        {post.title}
      </Link>
      <div className="text-xs text-muted-foreground">
        {post.blog && (
          <Link href={`/${post.blog.slug}`} className="hover:underline">
            {post.blog.name}
          </Link>
        )}
        <span className="mx-2">·</span>
        <span>{formatDate(post.published_at ?? post.created_at)}</span>
      </div>
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span>좋아요 {post.like_count}</span>
        <span>댓글 {post.comment_count}</span>
      </div>
    </article>
  );
}
