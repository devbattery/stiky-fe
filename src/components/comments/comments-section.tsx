'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getApiBaseUrl } from '@/lib/utils';
import type { CommentModel } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

async function fetchComments(postId: number, apiBase: string): Promise<CommentModel[]> {
  const res = await fetch(`${apiBase}/api/v1/posts/${postId}/comments`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('댓글을 불러오지 못했습니다.');
  }
  return (await res.json()) as CommentModel[];
}

function CommentItem({ comment }: { comment: CommentModel }) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-background p-4">
      <div className="flex items-center gap-2">
        <Avatar
          src={comment.author.profile_image_url ?? undefined}
          alt={comment.author.nickname ?? '익명'}
          className="h-9 w-9"
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">{comment.author.nickname ?? '익명'}</span>
          <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</span>
        </div>
      </div>
      <p className="text-sm text-foreground">{comment.content}</p>
      {comment.children && comment.children.length > 0 && (
        <div className="space-y-2 border-l border-border pl-4">
          {comment.children.map((child) => (
            <CommentItem key={child.id} comment={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentsSection({ postId }: { postId: number }) {
  const apiBase = getApiBaseUrl();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId, apiBase),
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!content.trim()) {
        throw new Error('댓글 내용을 입력하세요.');
      }
      const res = await fetch(`${apiBase}/api/v1/posts/${postId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('댓글을 작성하려면 로그인해야 합니다.');
        }
        throw new Error('댓글 작성에 실패했습니다.');
      }
      return res.json();
    },
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : '댓글 작성 중 오류가 발생했습니다.');
    },
  });

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">댓글</h2>
      <div className="space-y-2">
        <Textarea
          placeholder="댓글을 작성하세요"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? '등록 중...' : '댓글 등록'}
        </Button>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">댓글을 불러오는 중입니다...</p>
      ) : data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">첫 번째 댓글을 남겨보세요.</p>
      )}
    </section>
  );
}
