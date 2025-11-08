export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} DevAll</span>
        <span>FastAPI와 Next.js를 이용하여 만들었습니다.</span>
      </div>
    </footer>
  );
}
