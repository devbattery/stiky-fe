'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiPost, ApiError } from '@/lib/api';
import type { MeResponse, OnboardingPayload } from '@/lib/types';

export async function completeOnboardingAction(payload: OnboardingPayload) {
  try {
    const me = await apiPost<MeResponse>('/api/v1/me/onboard', payload);
    revalidatePath('/');
    const slug = me.blog?.slug ?? payload.blog_slug;
    redirect(`/${slug}/posts`);
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message, status: error.status };
    }
    return { error: '온보딩에 실패했습니다. 다시 시도해주세요.', status: 500 };
  }
}
