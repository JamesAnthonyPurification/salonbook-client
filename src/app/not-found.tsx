import Link from "next/link";
import Logo from "@/components/ui/Logo";

export const metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 text-center">
      <Logo />
      <p className="mt-10 font-display text-8xl font-semibold text-brand-200">404</p>
      <h1 className="mt-2 text-3xl font-semibold">This page took a day off</h1>
      <p className="mt-2 max-w-md text-stone-500">The page you&apos;re looking for doesn&apos;t exist or may have been moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">Back to home</Link>
        <Link href="/services" className="btn-outline">Browse services</Link>
      </div>
    </div>
  );
}
