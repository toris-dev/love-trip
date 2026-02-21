/**
 * @header 슬롯 로딩 시 스켈레톤.
 * 메인 콘텐츠와 독립적으로 스트리밍됨.
 */
export default function HeaderLoading() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-2 sm:px-3 md:px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </header>
  )
}
