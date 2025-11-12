import { notFound } from "next/navigation";
import { requireAuthenticated } from "@/lib/auth";
import { ApiError, apiGet } from "@/lib/api";
import type { PostDetail } from "@/lib/types";
import { EditPostFormWrapper } from "./edit-post-form-wrapper";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ postSlug: string }>;
}) {
  const { postSlug } = await params;
  const me = await requireAuthenticated({ requireOnboarded: true });
  const blogSlug = me.blog?.slug;
  if (!blogSlug) {
    notFound();
  }

  try {
    const post = await apiGet<PostDetail>(
      `/api/v-1/blogs/${blogSlug}/posts/${postSlug}`,
      { cache: "no-store" },
    );
    const defaultValues = {
      title: post.title,
      category: post.category,
      status: post.status,
      description: post.excerpt ?? "",
      content_md: post.content_md,
      tags: post.tags?.map((tag) => tag.slug).join(", ") ?? "",
      thumbnail_url: post.thumbnail_url ?? undefined,
    };

    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            게시물 수정
          </h1>
          <p className="text-sm text-muted-foreground">
            수정 후 저장하면 바로 갱신됩니다.
          </p>
        </div>
        <EditPostFormWrapper
          blogSlug={blogSlug}
          postSlug={postSlug}
          defaultValues={defaultValues}
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
