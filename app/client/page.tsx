"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function ClientProfilePage() {
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
      try {
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
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }
    fetchProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      await fetch("/api/client-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          phone,
          website,
          facebook,
          instagram,
          twitter,
          notes,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Business Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Keep your company info and social media handles updated for our agency team.
        </p>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Company Information
            </h2>
            <Input
              label="Business Name"
              placeholder="e.g. Acme Corporation"
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
              placeholder="https://yourbusiness.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          <div className="space-y-4 pt-2">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Social Media Links
            </h2>
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

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-700 tracking-wide">
              Notes for Agency Team
            </label>
            <textarea
              placeholder="Share specific brand guidelines, goals, or instructions..."
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none transition-all"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button type="submit" isLoading={loading} className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500">
              Save Profile Changes
            </Button>
            {saved && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ✅ Saved Successfully!
              </span>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}