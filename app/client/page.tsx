"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ClientDashboard() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/client-profile");
      const data = await res.json();
      if (data) {
        setBusinessName(data.businessName || "");
        setPhone(data.phone || "");
        setWebsite(data.website || "");
        setFacebook(data.facebook || "");
        setInstagram(data.instagram || "");
        setTwitter(data.twitter || "");
        setNotes(data.notes || "");
      }
    }
    fetchProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    await fetch("/api/client-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName, phone, website,
        facebook, instagram, twitter, notes,
      }),
    });

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800">FixyAds</h1>
          <p className="text-xs text-gray-400 mt-0.5">Client Portal</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <Link
            href="/client"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/client"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>👤</span> My Profile
          </Link>
          <Link
            href="/client/tasks"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/client/tasks"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>📋</span> My Tasks
          </Link>
          <Link
            href="/client/roadmap"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/client/roadmap"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>🗺️</span> My Roadmap
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium text-gray-800">{session?.user?.name}</p>
            <p className="text-xs text-gray-400">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-500 mt-1">
            Keep your details updated so our team can serve you better.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 max-w-2xl">
          <form onSubmit={handleSave} className="flex flex-col gap-5">

            <Input
              label="Business Name"
              type="text"
              placeholder="e.g. Acme Pvt Ltd"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Website URL"
              type="url"
              placeholder="https://yourwebsite.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-4">
                Social Media Links
              </p>
              <div className="flex flex-col gap-4">
                <Input
                  label="Facebook"
                  type="url"
                  placeholder="https://facebook.com/yourpage"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                />
                <Input
                  label="Instagram"
                  type="url"
                  placeholder="https://instagram.com/yourhandle"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
                <Input
                  label="Twitter / X"
                  type="url"
                  placeholder="https://twitter.com/yourhandle"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Notes for our team
              </label>
              <textarea
                placeholder="Anything specific you want us to know..."
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" fullWidth>
                {loading ? "Saving..." : "Save Profile"}
              </Button>
              {saved && (
                <p className="text-green-600 text-sm font-medium whitespace-nowrap">
                  ✅ Saved!
                </p>
              )}
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}