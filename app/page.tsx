import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">FixyAds</h1>
        <div className="flex items-center gap-4">
          <Link href="/contact" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            Contact
          </Link>
          <Link href="/login">
            <Button>Client Login</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-5xl font-bold text-gray-800 leading-tight">
          Grow Your Business <br />
          <span className="text-blue-600">With FixyAds</span>
        </h2>
        <p className="mt-4 text-gray-500 text-lg max-w-xl">
          Web development, SEO, and social media marketing — all managed in one portal.
        </p>
        <div className="flex gap-4 mt-8">
          <Link href="/contact">
            <Button>Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary">Sign In</Button>
          </Link>
        </div>
      </section>

    </main>
  );
}