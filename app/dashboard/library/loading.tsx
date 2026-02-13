import { Nav } from '@/components/Nav';

export default function LibraryLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Nav />
      </div>
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4 w-full">
        <div className="h-24 rounded-xl border border-slate-200 bg-white p-6">
          <div className="h-6 w-56 rounded animate-shimmer" />
        </div>
        <div className="h-[560px] rounded-xl border border-slate-200 bg-white animate-shimmer" />
      </main>
    </div>
  );
}
