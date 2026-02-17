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
        className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm shadow-md backdrop-blur-md ${
          role === "assistant"
            ? "border-violet-200/50 bg-violet-500/85 text-white"
            : "border-sky-200/50 bg-sky-400/80 text-stone-900"
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
