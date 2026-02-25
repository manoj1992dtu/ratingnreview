// app/categories/[slug]/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Skeleton */}
      <section className="bg-gradient-to-r from-primary to-indigo-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <div className="h-6 w-32 bg-white/20 rounded animate-pulse"></div>
          </div>
          
          <div className="h-12 w-3/4 bg-white/20 rounded mb-4 animate-pulse"></div>
          <div className="h-6 w-full max-w-3xl bg-white/20 rounded mb-8 animate-pulse"></div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="h-8 w-8 bg-white/20 rounded mb-2 animate-pulse"></div>
                <div className="h-8 w-20 bg-white/20 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-24 bg-white/20 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters Skeleton */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="h-10 w-full max-w-md bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex gap-3">
              <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company List Skeleton */}
          <div className="lg:col-span-2">
            <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse"></div>
            
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-6 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      <div className="h-4 w-64 bg-gray-200 rounded mb-3 animate-pulse"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-gray-100 pb-4">
                    <div className="h-4 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 w-3/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
              <div className="h-8 w-8 bg-yellow-200 rounded mb-3 animate-pulse"></div>
              <div className="h-5 w-32 bg-yellow-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-full bg-yellow-200 rounded mb-4 animate-pulse"></div>
            </div>

            <div className="bg-primary rounded-xl p-6">
              <div className="h-5 w-32 bg-indigo-500 rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-full bg-indigo-500 rounded mb-4 animate-pulse"></div>
              <div className="h-10 w-full bg-white rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}