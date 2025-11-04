export type UserPublic = {
  id: string;
  email: string;
  nickname?: string | null;
  profile_image_url?: string | null;
  onboarding_completed: boolean;
};

export type BlogPublic = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  cover_image_url?: string | null;
  owner?: Pick<UserPublic, 'id' | 'email' | 'nickname' | 'profile_image_url'>;
};

export type MeResponse = {
  user: UserPublic;
  blog?: BlogPublic | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
};

export type PostStatus = 'draft' | 'published' | 'private';

export type TagSummary = {
  id: number;
  name: string;
  slug: string;
  post_count?: number | null;
};

export type PostSummary = {
  id: number;
  title: string;
  slug: string;
  category: string;
  status: PostStatus;
  like_count: number;
  comment_count: number;
  view_count: number;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string | null;
  excerpt?: string | null;
  tags?: TagSummary[];
  blog?: Pick<BlogPublic, 'id' | 'name' | 'slug'>;
};

export type PostDetail = PostSummary & {
  content_md: string;
  content_html: string;
  tags: TagSummary[];
  author?: UserPublic;
  liked?: boolean;
}; 

export type CommentModel = {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  post_id: number;
  parent_id?: number | null;
  author: UserPublic;
  children?: CommentModel[];
};

export type LikeToggleResponse = {
  liked: boolean;
  like_count: number;
};

export type TrendingPost = PostSummary;

export type TrendingUser = {
  id: string;
  nickname: string;
  profile_image_url?: string | null;
  blog?: Pick<BlogPublic, 'id' | 'name' | 'slug'> | null;
  post_count?: number;
};

export type TrendingCategory = {
  category: string;
  posts: PostSummary[];
};

export type OtpVerifyResponse = {
  user: UserPublic;
  onboarding_required: boolean;
};

export type RequestOtpPayload = {
  email: string;
};

export type VerifyOtpPayload = {
  email: string;
  code: string;
};

export type OnboardingPayload = {
  nickname: string;
  blog_name: string;
  blog_slug: string;
  description?: string;
  profile_image_url?: string;
};

export type CreatePostPayload = {
  title: string;
  slug?: string;
  category: string;
  status: PostStatus;
  content_md: string;
  description?: string;
  thumbnail_url?: string | null;
  tags?: string[];
};

export type UpdatePostPayload = Partial<CreatePostPayload>;

export type AvailabilityResponse = {
  available: boolean;
  suggestion?: string;
};

export type UploadSignature = {
  api_key: string;
  timestamp: number;
  signature: string;
  folder: string;
  cloud_name: string;
};

export type CloudinaryUploadResponse = {
  asset_id: string;
  public_id: string;
  secure_url: string;
  url: string;
};
