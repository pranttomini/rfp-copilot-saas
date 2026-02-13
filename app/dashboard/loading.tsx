export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 w-1/3 bg-gray-200 rounded animate-shimmer" />
          <div className="h-9 w-24 bg-gray-200 rounded-lg animate-shimmer" />
        </div>
        <div className="space-y-5">
          {[1, 2, 3].map((r) => (
            <div key={r} className="flex gap-4 items-center">
              <div className="h-10 w-10 bg-gray-200 rounded-lg shrink-0 animate-shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-shimmer" />
                <div className="h-3 w-1/2 bg-gray-100 rounded animate-shimmer" />
              </div>
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
