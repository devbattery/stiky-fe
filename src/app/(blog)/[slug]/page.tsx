import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ApiError, apiGet } from '@/lib/api';
import type { BlogPublic, PaginatedResponse, PostSummary } from '@/lib/types';
import { PostCard } from '@/components/cards/post-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function BlogLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const blog = await apiGet<BlogPublic>(`/api/v1/blogs/${slug}`, undefined, { revalidate: 300 });
    const posts = await apiGet<PaginatedResponse<PostSummary>>(
      `/api/v1/blogs/${slug}/posts?page=1&size=5&status=published`,
      undefined,
      { revalidate: 60 },
    );

    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <section className="rounded-xl border border-border bg-background p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-foreground">{blog.name}</h1>
          {blog.description && <p className="mt-2 text-sm text-muted-foreground">{blog.description}</p>}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">최근 게시물</h2>
          {posts.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 게시물이 없습니다.</p>
          ) : (
            posts.items.map((post) => (
              <PostCard key={post.id} post={post} href={`/${blog.slug}/posts/${post.slug}`} />
            ))
          )}
        </section>

        <Card>
          <CardHeader>
            <CardTitle>전체 글 보기</CardTitle>
          </CardHeader>
          <CardContent>
            <Link className="text-sm text-foreground underline" href={`/${blog.slug}/posts`}>
              모두 보기 →
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
