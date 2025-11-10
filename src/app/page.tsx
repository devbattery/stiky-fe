import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { TrendingCategory, TrendingPost, TrendingUser } from "@/lib/types";
import { TrendingPostCard } from "@/components/cards/trending-post-card";
import { TrendingUserCard } from "@/components/cards/trending-user-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HomePage() {
  const [posts, users, categories] = await Promise.all([
    apiGet<TrendingPost[]>("/api/v1/trending/posts", undefined, { revalidate: 60 }),
    apiGet<TrendingUser[]>("/api/v1/trending/users", undefined, { revalidate: 60 }),
    apiGet<TrendingCategory[]>("/api/v1/trending/by-category", undefined, { revalidate: 60 }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">지금 가장 뜨거운 포스트</h1>
        <p className="text-sm text-muted-foreground">
          트렌딩 데이터를 기반으로 최근 인기가 높은 글과 작성자를 확인하세요.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>트렌딩 포스트</CardTitle>
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              새로 고침
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {posts.length === 0 ? (
              <p className="text-sm text-muted-foreground">아직 트렌딩 포스트가 없습니다.</p>
            ) : (
              posts.map((post) => <TrendingPostCard key={post.id} post={post} />)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>주목할 만한 작성자</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground">추천할 작성자가 아직 없어요.</p>
            ) : (
              users.map((user) => <TrendingUserCard key={user.id} user={user} />)
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">카테고리별 하이라이트</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground">표시할 카테고리가 없습니다.</p>
          )}
          {categories.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle>{category.category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.posts.slice(0, 3).map((post) => (
                  <TrendingPostCard key={post.id} post={post} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
