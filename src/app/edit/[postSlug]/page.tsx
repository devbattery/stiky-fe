import { notFound } from 'next/navigation';
import { requireAuthenticated } from '@/lib/auth';
import { ApiError, apiGet } from '@/lib/api';
import type { PostDetail } from '@/lib/types';
import { PostEditorForm } from '@/components/forms/post-editor-form';
import { deletePostAction, updatePostAction } from './actions';

export default async function EditPostPage({ params }: { params: Promise<{ postSlug: string }> }) {
  const { postSlug } = await params;
  const me = await requireAuthenticated({ requireOnboarded: true });
  const blogSlug = me.blog?.slug;

  if (!blogSlug) {
    notFound();
  }

  try {
    const post = await apiGet<PostDetail>(
      `/api/v1/blogs/${blogSlug}/posts/${postSlug}`,
      { cache: 'no-store' },
    );

    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">게시물 수정</h1>
          <p className="text-sm text-muted-foreground">수정 후 저장하면 바로 갱신됩니다.</p>
        </div>
        <PostEditorForm
          defaultValues={{
            title: post.title,
            category: post.category,
            status: post.status,
            description: post.excerpt ?? '',
            content_md: post.content_md,
            tags: post.tags?.map((tag) => tag.slug).join(', ') ?? '',
            thumbnail_url: post.thumbnail_url ?? undefined,
          }}
          onSubmit={(payload) => updatePostAction(blogSlug, postSlug, payload)}
          submitLabel="수정 완료"
          onDelete={() => deletePostAction(blogSlug, postSlug)}
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
