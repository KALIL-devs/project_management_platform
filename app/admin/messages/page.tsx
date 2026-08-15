"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";

type Message = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  service?: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchMessages() {
    try {
      const res = await fetch("/api/contact");
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  async function toggleReadStatus(id: string, currentReadState: boolean) {
    setUpdatingId(id);
    const newReadState = !currentReadState;

    // Optimistic UI update
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, read: newReadState } : msg))
    );

    try {
      await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: newReadState }),
      });
    } catch (err) {
      console.error("Failed to update read state:", err);
      // Revert optimistic update on error
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, read: currentReadState } : msg))
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contact Messages</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review contact form submissions from website visitors.
          </p>
        </div>
      </div>

      {loading ? (
        <Card padding="none">
          <LoadingState message="Loading messages..." />
        </Card>
      ) : messages.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No messages received yet"
          description="Inquiries submitted on your website contact form will appear here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              className={`transition-all duration-200 ${
                !msg.read ? "border-l-4 border-l-blue-600 bg-blue-50/10" : "border-slate-200/80"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-slate-900">{msg.name}</h2>
                    {!msg.read ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                        New
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500">
                        Read
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{msg.email}</p>
                  {msg.phone && <p className="text-xs text-slate-500">Phone: {msg.phone}</p>}
                  {msg.service && (
                    <p className="text-xs font-semibold text-blue-600 mt-1.5 inline-block bg-blue-50 px-2 py-0.5 rounded-md">
                      Service Interested: {msg.service.toUpperCase()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <Button
                    variant={msg.read ? "outline" : "secondary"}
                    size="sm"
                    isLoading={updatingId === msg.id}
                    onClick={() => toggleReadStatus(msg.id, msg.read)}
                  >
                    {msg.read ? "Mark Unread" : "Mark as Read ✓"}
                  </Button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}