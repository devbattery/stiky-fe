'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getApiBaseUrl } from '@/lib/utils';
import type { OtpVerifyResponse } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const apiBase = getApiBaseUrl();

  const requestOtp = async () => {
    if (!email) {
      toast.error('이메일을 입력하세요.');
      return;
    }
    try {
      const res = await fetch(`${apiBase}/api/v1/auth/request-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        throw new Error('인증 코드를 요청할 수 없습니다. 잠시 후 다시 시도해주세요.');
      }
      toast.success('인증 코드가 전송되었습니다. 메일함을 확인하세요.');
      setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'OTP 요청 중 오류가 발생했습니다.');
    }
  };

  const verifyOtp = async () => {
    if (!code) {
      toast.error('인증 코드를 입력하세요.');
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch(`${apiBase}/api/v1/auth/verify-otp`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({ email, code }),
        });
        if (!res.ok) {
          if (res.status === 400) {
            toast.error('인증 코드가 올바르지 않습니다.');
            return;
          }
          throw new Error('로그인에 실패했습니다. 다시 시도해주세요.');
        }
        const data = (await res.json()) as OtpVerifyResponse;
        toast.success('로그인되었습니다.');
        const redirectTo = searchParams.get('next');
        if (data.onboarding_required) {
          router.push('/onboarding');
        } else if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push('/');
        }
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'OTP 인증에 실패했습니다.');
      }
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">로그인</h1>
        <p className="text-sm text-muted-foreground">이메일로 받은 인증 코드를 입력해 로그인하세요.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="email">
            이메일
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={sent}
            autoFocus
          />
        </div>

        {sent && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="code">
              인증 코드
            </label>
            <Input
              id="code"
              placeholder="123456"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              maxLength={6}
            />
          </div>
        )}
      </div>

      {!sent ? (
        <Button onClick={requestOtp} disabled={pending}>
          {pending ? '요청 중...' : '인증 코드 요청'}
        </Button>
      ) : (
        <Button onClick={verifyOtp} disabled={pending}>
          {pending ? '확인 중...' : '인증 코드 확인'}
        </Button>
      )}

      {sent && (
        <button
          type="button"
          className="text-xs text-muted-foreground underline"
          onClick={() => {
            setSent(false);
            setCode('');
          }}
        >
          이메일을 변경하시겠어요?
        </button>
      )}
    </div>
  );
}
