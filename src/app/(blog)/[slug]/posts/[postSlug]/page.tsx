import { notFound } from 'next/navigation';
import { ApiError, apiGet } from '@/lib/api';
import type { PostDetail } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { LikeButton } from '@/components/likes/like-button';
import { CommentsSection } from '@/components/comments/comments-section';

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
}) {
  const { slug, postSlug } = await params;
  try {
    const post = await apiGet<PostDetail>(
      `/api/v1/blogs/${slug}/posts/${postSlug}`,
      { cache: 'no-store' },
    );

    return (
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
        <header className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Badge>{post.category}</Badge>
            <span>{formatDate(post.published_at ?? post.created_at)}</span>
            <span>조회 {post.view_count.toLocaleString()}</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{post.title}</h1>
          {post.author && (
            <p className="text-sm text-muted-foreground">by {post.author.nickname ?? post.author.email}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {post.tags?.map((tag) => (
              <Badge key={tag.id} className="bg-muted text-muted-foreground">
                #{tag.slug}
              </Badge>
            ))}
          </div>
        </header>

        <section
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content_html }}
        />

        <div className="flex items-center justify-between border-y border-border py-4">
          <LikeButton
            postId={post.id}
            initialLiked={post.liked ?? false}
            initialLikeCount={post.like_count}
          />
          <span className="text-sm text-muted-foreground">댓글 {post.comment_count.toLocaleString()}</span>
        </div>

        <CommentsSection postId={post.id} />
      </article>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
