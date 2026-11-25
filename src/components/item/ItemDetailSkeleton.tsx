/** Shimmer placeholder while an item's detail streams in. */
export function ItemDetailSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="grid gap-7 md:grid-cols-2 md:gap-10">
      <span className="sr-only">جارٍ التحميل…</span>
      <div className="skeleton aspect-[5/4] w-full rounded-[30px]" />
      <div className="flex flex-col gap-4">
        <div className="skeleton h-10 w-2/3 rounded-xl" />
        <div className="skeleton h-4 w-1/3 rounded-lg" />
        <div className="mt-2 flex gap-2">
          <div className="skeleton h-12 w-36 rounded-[18px]" />
          <div className="skeleton h-12 w-36 rounded-[18px]" />
        </div>
        <div className="skeleton mt-2 h-13 w-full rounded-full" />
        <div className="skeleton h-36 w-full rounded-card" />
      </div>
    </div>
  );
}
