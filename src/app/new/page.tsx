import { requireAuthenticated } from "@/lib/auth";
import { NewPostFormWrapper } from "./new-post-form-wrapper";

export default async function NewPostPage() {
  const me = await requireAuthenticated({ requireOnboarded: true });
  const blogSlug = me.blog?.slug;
  if (!blogSlug) {
    throw new Error("블로그 정보가 없습니다. 온보딩을 먼저 완료해주세요.");
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">새 글 작성</h1>
        <p className="text-sm text-muted-foreground">
          Markdown 에디터를 사용해 글을 작성하고 바로 발행해보세요.
        </p>
      </div>
      {}
      <NewPostFormWrapper blogSlug={blogSlug} />
    </div>
  );
}
