import { Nav } from '@/components/Nav';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Nav />
      </div>
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 w-full">
        <div className="surface-card p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-1/3 rounded animate-shimmer" />
            <div className="h-9 w-24 rounded-lg animate-shimmer" />
          </div>
          <div className="space-y-5">
            {[1, 2, 3].map((r) => (
              <div key={r} className="flex gap-4 items-center">
                <div className="h-10 w-10 rounded-lg shrink-0 animate-shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded animate-shimmer" />
                  <div className="h-3 w-1/2 rounded animate-shimmer" />
                </div>
                <div className="h-6 w-16 rounded-full animate-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
