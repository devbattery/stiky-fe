import Link from 'next/link';
import type { PostSummary } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function PostCard({ post, href }: { post: PostSummary; href: string }) {
  return (
    <article className="space-y-3 rounded-lg border border-border bg-background p-5 shadow-sm">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <Badge>{post.category}</Badge>
        <span>{formatDate(post.published_at ?? post.created_at)}</span>
      </div>
      <div className="space-y-2">
        <Link href={href} className="text-lg font-semibold text-foreground hover:underline">
          {post.title}
        </Link>
        {post.excerpt && <p className="text-sm text-muted-foreground">{post.excerpt}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>좋아요 {post.like_count.toLocaleString()}</span>
        <span>댓글 {post.comment_count.toLocaleString()}</span>
        <span>조회 {post.view_count.toLocaleString()}</span>
      </div>
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag.id} className="bg-muted text-muted-foreground">
              #{tag.slug}
            </Badge>
          ))}
        </div>
      )}
    </article>
  );
}
