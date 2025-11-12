'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiPost, ApiError } from '@/lib/api';
import type { CreatePostPayload, PostDetail } from '@/lib/types';

export async function createPostAction(blogSlug: string, payload: CreatePostPayload) {
  try {
    const post = await apiPost<PostDetail>(`/api/v1/blogs/${blogSlug}/posts`, payload);
    revalidatePath(`/${blogSlug}/posts`);
    const targetSlug = post.slug ?? payload.slug ?? '';
    redirect(`/${blogSlug}/posts/${targetSlug}`);
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message, status: error.status };
    }
    return { error: '게시물 등록에 실패했습니다. 다시 시도해주세요.', status: 500 };
  }
}
