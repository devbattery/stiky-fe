import Link from 'next/link';
import { getOptionalMe } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/auth/logout-button';

export async function SiteHeader() {
  const me = await getOptionalMe();

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold text-foreground">
          DevAll Blog
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            홈
          </Link>
          {me ? (
            <>
              {me.blog ? (
                <Link href={`/${me.blog.slug}/posts`} className="hover:text-foreground">
                  내 글 목록
                </Link>
              ) : (
                <Link href="/onboarding" className="hover:text-foreground">
                  온보딩 완료하기
                </Link>
              )}
              <Button asChild size="sm" variant="secondary">
                <Link href="/new">새 글 작성</Link>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">로그인</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
