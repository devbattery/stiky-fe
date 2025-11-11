import { redirect } from 'next/navigation';
import { completeOnboardingAction } from './actions';
import { OnboardingForm } from '@/components/forms/onboarding-form';
import { ApiError, apiGet } from '@/lib/api';
import type { MeResponse } from '@/lib/types';

export default async function OnboardingPage() {
  let me: MeResponse | null = null;
  try {
    me = await apiGet<MeResponse>('/api/v1/me');
    if (me.blog) {
      redirect(`/${me.blog.slug}/posts`);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        redirect('/login');
      }
      if (error.status === 428 && error.data) {
        me = error.data as MeResponse;
      }
    } else {
      throw error;
    }
  }

  const defaultValues = {
    nickname: me?.user.nickname ?? '',
    blog_name: me?.blog?.name ?? '',
    blog_slug: me?.blog?.slug ?? '',
    description: me?.blog?.description ?? '',
    profile_image_url: me?.user.profile_image_url ?? '',
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">온보딩을 완료하세요</h1>
        <p className="text-sm text-muted-foreground">
          블로그 정보를 입력하면 글 작성과 맞춤형 피드를 이용할 수 있습니다.
        </p>
      </div>
      <OnboardingForm defaultValues={defaultValues} onSubmit={completeOnboardingAction} />
    </div>
  );
}
