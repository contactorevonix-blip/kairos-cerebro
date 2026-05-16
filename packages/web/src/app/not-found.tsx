import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0a] text-white">
      <p className="font-mono text-sm text-white/30">404</p>
      <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
      <Link href="/" className="mt-2 text-sm text-accent hover:underline">
        Back to home →
      </Link>
    </div>
  );
}
