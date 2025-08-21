export function EditVideoSkeleton() {
  return (
    <div className="min-h-dvh bg-white pb-14 sm:pb-0">
      <main className="mx-auto max-w-4xl px-3 sm:px-4 py-6 grid gap-6">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-gray-200 animate-pulse mb-4" />
          <div className="h-7 sm:h-8 w-64 mx-auto bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-48 mx-auto bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid gap-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-32 sm:h-40 w-full bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-3 pt-4">
              <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-28 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="aspect-video w-full bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="h-16 w-full bg-gray-100 rounded-lg animate-pulse" />
      </main>
    </div>
  )
}
