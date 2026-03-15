export default function Loading() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-8" />
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-4" />
        <div className="h-12 w-full bg-gray-100 rounded animate-pulse mb-8" />
        <div className="flex gap-4 mb-12">
          <div className="h-6 w-24 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-6 w-24 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-6 w-24 bg-gray-100 rounded-full animate-pulse" />
        </div>
        <div className="aspect-video w-full bg-gray-100 rounded-2xl animate-pulse mb-12" />
        <div className="space-y-4">
          <div className="h-4 w-full bg-gray-50 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-50 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-gray-50 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}
