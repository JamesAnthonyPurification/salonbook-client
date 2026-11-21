export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="container-x grid items-stretch gap-10 py-10 lg:grid-cols-2 lg:py-16">
      <div className="relative hidden overflow-hidden rounded-3xl lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80&auto=format&fit=crop"
          alt="Stylist at work in a bright salon"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/30 to-transparent" />
        <div className="absolute right-8 bottom-8 left-8 text-white">
          <p className="font-display text-3xl leading-tight font-semibold text-white">
            &ldquo;The easiest way to book my monthly blow-dry.&rdquo;
          </p>
          <p className="mt-3 text-sm text-stone-200">— Priya S., SalonBook regular</p>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
          <p className="mt-2 text-stone-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </section>
  );
}
