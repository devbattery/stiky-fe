"use client";

import { PostEditorForm } from "@/components/forms/post-editor-form";
import type { CreatePostPayload } from "@/lib/types";
import { createPostAction } from "./actions";

export function NewPostFormWrapper({ blogSlug }: { blogSlug: string }) {
  const handleSubmit = (payload: CreatePostPayload) => {
    return createPostAction(blogSlug, payload);
  };

  return <PostEditorForm onSubmit={handleSubmit} />;
}
