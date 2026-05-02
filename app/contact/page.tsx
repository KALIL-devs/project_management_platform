"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, service, message }),
    });

    if (res.ok) {
      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setService("");
      setMessage("");
    } else {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-lg">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Get in Touch</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Fill the form below and our team will get back to you shortly.
          </p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800">Message Sent!</h2>
            <p className="text-gray-500 mt-2 text-sm">
              We'll get back to you within 24 hours.
            </p>
            <div className="mt-6">
              <Button onClick={() => setSuccess(false)}>Send Another</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Service Interested In
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a service</option>
                <option value="web">Web Development</option>
                <option value="seo">SEO</option>
                <option value="smm">Social Media Marketing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Message</label>
              <textarea
                placeholder="Tell us about your project..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button type="submit" fullWidth>
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </form>
        )}

      </Card>
    </main>
  );
}