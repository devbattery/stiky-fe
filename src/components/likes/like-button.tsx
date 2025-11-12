'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getApiBaseUrl } from '@/lib/utils';
import type { LikeToggleResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';

export function LikeButton({
  postId,
  initialLiked = false,
  initialLikeCount,
}: {
  postId: number;
  initialLiked?: boolean;
  initialLikeCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialLikeCount);
  const apiBase = getApiBaseUrl();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${apiBase}/api/v1/posts/${postId}/likes/toggle`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('로그인이 필요합니다.');
        }
        throw new Error('좋아요 처리 중 오류가 발생했습니다.');
      }
      return (await res.json()) as LikeToggleResponse;
    },
    onSuccess: (data) => {
      setLiked(data.liked);
      setCount(data.like_count);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : '좋아요 처리에 실패했습니다.');
    },
  });

  return (
    <Button
      variant={liked ? 'secondary' : 'outline'}
      size="sm"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {liked ? '좋아요 취소' : '좋아요'} · {count.toLocaleString()}
    </Button>
  );
}
