"use client";

import {
  PostEditorForm,
  type PostEditorValues,
} from "@/components/forms/post-editor-form";
import type { CreatePostPayload } from "@/lib/types";
import { deletePostAction, updatePostAction } from "./actions";

export function EditPostFormWrapper({
  blogSlug,
  postSlug,
  defaultValues,
}: {
  blogSlug: string;
  postSlug: string;
  defaultValues: Partial<PostEditorValues>;
}) {
  const handleUpdate = (payload: CreatePostPayload) => {
    return updatePostAction(blogSlug, postSlug, payload);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "정말로 이 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      )
    ) {
      return deletePostAction(blogSlug, postSlug);
    }
    return Promise.resolve(undefined);
  };

  return (
    <PostEditorForm
      defaultValues={defaultValues}
      onSubmit={handleUpdate}
      submitLabel="수정 완료"
      onDelete={handleDelete}
    />
  );
}
