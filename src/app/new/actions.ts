'use server';
import { revalidatePath } from 'next/cache';
import { apiPost, ApiError } from '@/lib/api';
import type { CreatePostPayload, PostDetail } from '@/lib/types';

export type PostActionResult = {
  success: true;
  redirectUrl: string;
} | {
  success: false;
  error: string;
};

export async function createPostAction(blogSlug: string, payload: CreatePostPayload): Promise<PostActionResult> {
  try {
    const post = await apiPost<PostDetail>(`/api/v1/blogs/${blogSlug}/posts`, payload, { cache: 'no-store' });

    revalidatePath(`/${blogSlug}/posts`);

    const targetSlug = post.slug ?? '';

    return {
      success: true,
      redirectUrl: `/${blogSlug}/posts/${targetSlug}`,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: '게시물 등록에 실패했습니다. 다시 시도해주세요.' };
  }
}