import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <main className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-5xl font-bold text-foreground mb-4">
          Welcome to OpenSea App
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          A modern Next.js application with authentication and API integration
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/login"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium min-w-[150px]"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium min-w-[150px]"
          >
            Register
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              🚀 Next.js 16
            </h3>
            <p className="text-sm text-muted-foreground">
              Built with the latest version of Next.js with App Router
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              🎨 Tailwind CSS
            </h3>
            <p className="text-sm text-muted-foreground">
              Styled with Tailwind CSS and shadcn/ui components
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              🔌 API Ready
            </h3>
            <p className="text-sm text-muted-foreground">
              Pre-configured API client for OpenSea-API integration
            </p>
          </div>
        </div>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Features
          </h2>
          <ul className="text-left max-w-2xl mx-auto space-y-2 text-muted-foreground">
            <li>✓ TypeScript support</li>
            <li>✓ ESLint + Prettier integration</li>
            <li>✓ Authentication system ready</li>
            <li>✓ Public and private routes</li>
            <li>✓ Dashboard layout</li>
            <li>✓ API client with interceptors</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
