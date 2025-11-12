'use server';

import { revalidatePath } from 'next/cache';
// import { redirect } from 'next/navigation'; // <-- redirect를 더 이상 사용하지 않음
import { apiDelete, apiPatch, ApiError } from '@/lib/api';
import type { UpdatePostPayload, PostDetail } from '@/lib/types';

// 서버 액션의 반환 타입을 명확하게 정의합니다.
// 이 타입은 나중에 폼 컴포넌트에서도 사용될 수 있습니다.
export type PostActionResult = {
  success: true;
  redirectUrl: string;
} | {
  success: false;
  error: string;
  status?: number;
};

export async function updatePostAction(
  blogSlug: string,
  postSlug: string,
  payload: UpdatePostPayload,
): Promise<PostActionResult> {
  try {
    const post = await apiPatch<PostDetail>(
      `/api/v1/blogs/${blogSlug}/posts/${postSlug}`,
      payload,
      { cache: 'no-store' },
    );
    revalidatePath(`/${blogSlug}/posts/${postSlug}`);

    return {
      success: true,
      redirectUrl: `/${blogSlug}/posts/${post.slug ?? postSlug}`,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message, status: error.status };
    }
    return { success: false, error: '게시물을 수정할 수 없습니다. 다시 시도해주세요.' };
  }
}

export async function deletePostAction(blogSlug: string, postSlug: string): Promise<PostActionResult> {
  try {
    await apiDelete(`/api/v1/blogs/${blogSlug}/posts/${postSlug}`);
    revalidatePath(`/${blogSlug}/posts`);

    return {
      success: true,
      redirectUrl: `/${blogSlug}/posts`,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message, status: error.status };
    }
    return { success: false, error: '게시물을 삭제할 수 없습니다. 다시 시도해주세요.' };
  }
}