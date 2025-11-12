import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ApiError, apiGet } from '@/lib/api';
import type { PaginatedResponse, PostSummary, TagSummary } from '@/lib/types';
import { PostCard } from '@/components/cards/post-card';
import { TagFilter, type TagFilterItem } from '@/components/sidebar/tag-filter';

function buildSearchParams(
  params: Record<string, string | number | undefined | null>,
  current: Record<string, string | string[] | undefined>,
) {
  const search = new URLSearchParams();
  Object.entries(current).forEach(([key, value]) => {
    if (typeof value === 'string') {
      search.set(key, value);
    }
  });
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      search.delete(key);
    } else {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export default async function BlogPostsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const resolvedSearch = await searchParams;

  const page = Number(resolvedSearch.page ?? 1) || 1;
  const size = Number(resolvedSearch.size ?? 10) || 10;
  const tag = typeof resolvedSearch.tag === 'string' ? resolvedSearch.tag : undefined;
  const category =
    typeof resolvedSearch.category === 'string' ? resolvedSearch.category : undefined;

  const query = new URLSearchParams({ page: String(page), size: String(size) });
  if (tag) query.set('tag', tag);
  if (category) query.set('category', category);

  try {
    const [posts, tags] = await Promise.all([
      apiGet<PaginatedResponse<PostSummary>>(
        `/api/v1/blogs/${slug}/posts?${query.toString()}`,
      ),
      apiGet<TagSummary[]>(`/api/v1/blogs/${slug}/tags`, undefined, { revalidate: 300 }),
    ]);

    const items: TagFilterItem[] = tags.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      count: item.post_count,
      href: buildSearchParams({ tag: item.slug, page: 1 }, resolvedSearch),
    }));

    const totalPages = Math.max(1, Math.ceil(posts.total / posts.size));

    return (
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 md:grid-cols-[1fr_300px]">
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">전체 게시물</h1>
          {posts.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">조건에 해당하는 게시물이 없습니다.</p>
          ) : (
            posts.items.map((post) => (
              <PostCard key={post.id} post={post} href={`/${slug}/posts/${post.slug}`} />
            ))
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {posts.total.toLocaleString()}개의 게시물 · {page}/{totalPages} 페이지
            </span>
            <div className="flex gap-2">
              <Link
                href={buildSearchParams({ page: Math.max(1, page - 1) }, resolvedSearch)}
                className={`rounded-md border border-border px-3 py-1 text-sm ${
                  page <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-muted'
                }`}
              >
                이전
              </Link>
              <Link
                href={buildSearchParams({ page: Math.min(totalPages, page + 1) }, resolvedSearch)}
                className={`rounded-md border border-border px-3 py-1 text-sm ${
                  page >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-muted'
                }`}
              >
                다음
              </Link>
            </div>
          </div>
        </section>

        <TagFilter
          items={items}
          active={tag}
          allHref={buildSearchParams({ tag: undefined, page: 1 }, resolvedSearch)}
        />
      </div>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
