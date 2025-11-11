'use client';

import { useCallback, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { uploadImage } from '@/lib/cloudinary';
import { getApiBaseUrl } from '@/lib/utils';
import type { OnboardingPayload } from '@/lib/types';

export type OnboardingFormResult = { error?: string };

const schema = z.object({
  nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다'),
  blog_name: z.string().min(2, '블로그 이름을 입력하세요'),
  blog_slug: z
    .string()
    .min(2, '영문 소문자와 숫자, 하이픈만 사용할 수 있습니다')
    .regex(/^[a-z0-9-]+$/, '영문 소문자, 숫자, 하이픈(-)만 입력 가능합니다'),
  description: z.string().max(500, '설명은 500자 이하여야 합니다').optional().or(z.literal('')),
  profile_image_url: z.string().url().optional().or(z.literal('')),
});

export type OnboardingFormValues = z.infer<typeof schema>;

export function OnboardingForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: Partial<OnboardingFormValues>;
  onSubmit: (values: OnboardingPayload) => Promise<OnboardingFormResult | void>;
}) {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const [checkingNickname, setCheckingNickname] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const apiBase = getApiBaseUrl();

  const checkAvailability = useCallback(
    async (type: 'nickname' | 'blog-slug', value: string) => {
      if (!value) return;
      const setter = type === 'nickname' ? setCheckingNickname : setCheckingSlug;
      setter(true);
      try {
        const res = await fetch(`${apiBase}/api/v1/me/availability/${type}?value=${encodeURIComponent(value)}`, {
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error('중복 확인에 실패했습니다');
        }
        const data = (await res.json()) as { available: boolean; suggestion?: string };
        if (!data.available) {
          setError(type === 'nickname' ? 'nickname' : 'blog_slug', {
            type: 'manual',
            message: '이미 사용 중입니다.',
          });
          toast.error('이미 사용 중입니다. 다른 값을 사용해주세요.');
        } else {
          clearErrors(type === 'nickname' ? 'nickname' : 'blog_slug');
          toast.success('사용 가능한 값입니다.');
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '중복 확인 중 오류 발생');
      } finally {
        setter(false);
      }
    },
    [apiBase, clearErrors, setError],
  );

  const handleProfileImageChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const uploadToast = toast.loading('이미지를 업로드하는 중입니다...');
        const result = await uploadImage(file);
        setValue('profile_image_url', result.secure_url, { shouldValidate: true });
        toast.success('프로필 이미지가 업로드되었습니다.', { id: uploadToast });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.');
      }
    },
    [setValue],
  );

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (values) => {
        const payload: OnboardingPayload = {
          nickname: values.nickname,
          blog_name: values.blog_name,
          blog_slug: values.blog_slug,
          description: values.description ?? undefined,
          profile_image_url: values.profile_image_url ?? undefined,
        };
        const result = await onSubmit(payload);
        if (result && 'error' in result && result.error) {
          toast.error(result.error);
        } else {
          toast.success('온보딩이 완료되었습니다. 곧 이동합니다...');
        }
      })}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="nickname">
          닉네임
        </label>
        <div className="flex gap-2">
          <Input id="nickname" {...register('nickname')} placeholder="예: devall" autoComplete="off" />
          <Button
            type="button"
            variant="secondary"
            onClick={() => checkAvailability('nickname', watch('nickname'))}
            disabled={checkingNickname}
          >
            {checkingNickname ? '확인 중...' : '중복 확인'}
          </Button>
        </div>
        {errors.nickname && <p className="text-sm text-red-600">{errors.nickname.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="blog_name">
          블로그 이름
        </label>
        <Input id="blog_name" {...register('blog_name')} placeholder="예: DevAll 블로그" />
        {errors.blog_name && <p className="text-sm text-red-600">{errors.blog_name.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="blog_slug">
          블로그 주소
        </label>
        <div className="flex gap-2">
          <Input id="blog_slug" {...register('blog_slug')} placeholder="예: devall" autoComplete="off" />
          <Button
            type="button"
            variant="secondary"
            onClick={() => checkAvailability('blog-slug', watch('blog_slug'))}
            disabled={checkingSlug}
          >
            {checkingSlug ? '확인 중...' : '중복 확인'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">URL은 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.</p>
        {errors.blog_slug && <p className="text-sm text-red-600">{errors.blog_slug.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="description">
          소개
        </label>
        <Textarea
          id="description"
          rows={4}
          {...register('description')}
          placeholder="블로그를 간단히 소개해주세요."
        />
        {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="profile_image">
          프로필 이미지
        </label>
        <input
          id="profile_image"
          type="file"
          accept="image/*"
          onChange={handleProfileImageChange}
          className="text-sm"
        />
        {watch('profile_image_url') && (
          <p className="text-xs text-muted-foreground">현재 이미지: {watch('profile_image_url')}</p>
        )}
        {errors.profile_image_url && <p className="text-sm text-red-600">{errors.profile_image_url.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? '저장 중...' : '온보딩 완료하기'}
      </Button>
    </form>
  );
}
