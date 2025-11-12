"use client";

import { type ChangeEvent, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import { uploadImage } from "@/lib/cloudinary";
import type { CreatePostPayload } from "@/lib/types";

export type PostEditorResult = { error?: string };

const schema = z.object({
  title: z.string().min(2, "제목을 입력하세요"),
  category: z.string().min(1, "카테고리를 입력하세요"),
  status: z.enum(["draft", "published", "private"]),
  description: z.string().optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
  thumbnail_url: z.string().url().optional().or(z.literal("")),
  content_md: z.string().min(10, "본문을 작성해주세요"),
});

export type PostEditorValues = z.infer<typeof schema>;

export function PostEditorForm({
  defaultValues,
  onSubmit,
  submitLabel = "저장",
  onDelete,
}: {
  defaultValues?: Partial<PostEditorValues>;
  onSubmit: (payload: CreatePostPayload) => Promise<PostEditorResult | void>;
  submitLabel?: string;
  onDelete?: () => Promise<PostEditorResult | void>;
}) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostEditorValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "draft",
      content_md: "",
      ...defaultValues,
    },
  });

  const handleUpload = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const toastId = toast.loading("이미지를 업로드하는 중입니다...");
        const result = await uploadImage(file);
        setValue("thumbnail_url", result.secure_url, { shouldValidate: true });
        toast.success("표지 이미지가 등록되었습니다.", { id: toastId });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "이미지 업로드에 실패했습니다.",
        );
      }
    },
    [setValue],
  );

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (values) => {
        const payload: CreatePostPayload = {
          title: values.title,
          category: values.category,
          status: values.status,
          description: values.description || undefined,
          thumbnail_url: values.thumbnail_url || undefined,
          content_md: values.content_md,
          tags: values.tags
            ?.split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        };
        const result = await onSubmit(payload);
        if (result && result.error) {
          toast.error(result.error);
        } else {
          toast.success("게시물이 저장되었습니다. 잠시만 기다려주세요.");
        }
      })}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">제목</label>
        <Input placeholder="글 제목을 입력하세요" {...register("title")} />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            카테고리
          </label>
          <Select {...register("category")}>
            <option value="free">자유</option>
            <option value="dev">개발</option>
            <option value="celeb">연예</option>
            <option value="love">사랑</option>
            <option value="work">직장</option>
            <option value="book">책</option>
            <option value="health">건강</option>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            공개 상태
          </label>
          <Select {...register("status")}>
            <option value="draft">임시 저장</option>
            <option value="published">공개</option>
            <option value="private">비공개</option>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">요약</label>
        <Textarea
          rows={3}
          placeholder="글에 대한 간단한 설명을 입력하세요"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          태그 (쉼표로 구분)
        </label>
        <Input
          placeholder="예: fastapi, nextjs, devall"
          {...register("tags")}
        />
        {errors.tags && (
          <p className="text-sm text-red-600">{errors.tags.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          표지 이미지
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="text-sm"
        />
        {watch("thumbnail_url") && (
          <p className="text-xs text-muted-foreground">
            현재 이미지: {watch("thumbnail_url")}
          </p>
        )}
        {errors.thumbnail_url && (
          <p className="text-sm text-red-600">{errors.thumbnail_url.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">본문</label>
        <Controller
          control={control}
          name="content_md"
          render={({ field }) => (
            <MarkdownEditor
              value={field.value ?? ""}
              onChange={(markdown) => field.onChange(markdown)}
            />
          )}
        />
        {errors.content_md && (
          <p className="text-sm text-red-600">{errors.content_md.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        {onDelete ? (
          <Button
            type="button"
            variant="destructive"
            disabled={isSubmitting}
            onClick={async () => {
              try {
                const result = await onDelete();
                if (result && result.error) {
                  toast.error(result.error);
                }
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "삭제에 실패했습니다.",
                );
              }
            }}
          >
            삭제하기
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "저장 중..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
