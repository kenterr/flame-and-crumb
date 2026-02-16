"use client";

type Role = "user" | "assistant";

interface ChatMessageProps {
  role: Role;
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div
      className={`flex w-full ${role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
          role === "assistant"
            ? "bg-[#8B7BB8] text-white"
            : "bg-[#A8D4E6] text-stone-900"
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
