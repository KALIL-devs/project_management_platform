import { prisma } from "@/lib/prisma";

export default async function MessagesPage() {
  const messages = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
        <p className="text-gray-500 mt-1">Contact form submissions from your website.</p>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-gray-500">No messages yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-2xl shadow-sm p-6 border ${
                msg.read ? "border-gray-100" : "border-blue-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {msg.name}
                    </h2>
                    {!msg.read && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{msg.email}</p>
                  {msg.phone && (
                    <p className="text-sm text-gray-500">{msg.phone}</p>
                  )}
                  {msg.service && (
                    <p className="text-sm text-blue-600 mt-1">
                      Service: {msg.service}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <p className="text-gray-600 mt-4 text-sm leading-relaxed">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}