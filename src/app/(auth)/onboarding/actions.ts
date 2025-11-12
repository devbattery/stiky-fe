'use server';
import { revalidatePath } from 'next/cache';
import { apiPost, ApiError } from '@/lib/api';
import type { MeResponse, OnboardingPayload } from '@/lib/types';

export type OnboardingActionResult = { /* ... */ };

export async function completeOnboardingAction(payload: OnboardingPayload): Promise<OnboardingActionResult> {
  try {
    // 1. 온보딩 API 호출
    const meOnboardResponse = await apiPost<MeResponse>('/api/v1/me/onboard', payload, {
      cache: 'no-store',
    });

    // 2. 응답 검증
    if (!meOnboardResponse?.blog?.slug) {
      return { success: false, error: '온보딩 처리 후 블로그 정보를 받지 못했습니다. 잠시 후 다시 시도해주세요.' };
    }

    const slug = meOnboardResponse.blog.slug;

    // 3. 캐시 무효화
    revalidatePath('/', 'layout');

    return {
      success: true,
      redirectUrl: `/${slug}/posts`,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message, status: error.status };
    }
    return { success: false, error: '온보딩에 실패했습니다. 다시 시도해주세요.' };
  }
}