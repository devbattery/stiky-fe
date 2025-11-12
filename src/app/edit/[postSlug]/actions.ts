'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiDelete, apiPatch, ApiError } from '@/lib/api';
import type { CreatePostPayload, PostDetail, UpdatePostPayload } from '@/lib/types';

export async function updatePostAction(
  blogSlug: string,
  postSlug: string,
  payload: CreatePostPayload,
) {
  try {
    const updatePayload: UpdatePostPayload = {
      title: payload.title,
      category: payload.category,
      status: payload.status,
      description: payload.description,
      thumbnail_url: payload.thumbnail_url,
      content_md: payload.content_md,
      tags: payload.tags,
    };
    const post = await apiPatch<PostDetail>(
      `/api/v1/blogs/${blogSlug}/posts/${postSlug}`,
      updatePayload,
      { cache: 'no-store' },
    );
    revalidatePath(`/${blogSlug}/posts/${postSlug}`);
    redirect(`/${blogSlug}/posts/${post.slug ?? postSlug}`);
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message, status: error.status };
    }
    return { error: '게시물을 수정할 수 없습니다. 다시 시도해주세요.', status: 500 };
  }
}

export async function deletePostAction(blogSlug: string, postSlug: string) {
  try {
    await apiDelete(`/api/v1/blogs/${blogSlug}/posts/${postSlug}`);
    revalidatePath(`/${blogSlug}/posts`);
    redirect(`/${blogSlug}/posts`);
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message, status: error.status };
    }
    return { error: '게시물을 삭제할 수 없습니다. 다시 시도해주세요.', status: 500 };
  }
}
