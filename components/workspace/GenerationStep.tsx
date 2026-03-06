"use client";

export interface GenerationStepData {
  id: number | string;
  status: "pending" | "active" | "complete";
  message: string;
}

export function GenerationStep({ status, message }: GenerationStepData) {
  return (
    <div className="flex items-start gap-3 py-2">
      {/* Status indicator */}
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        {status === "active" && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#27272a] border-t-[#7c3aed]" />
        )}
        {status === "complete" && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 8.5l3.5 3.5L13 4"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {status === "pending" && (
          <div className="h-2 w-2 rounded-full bg-[#3f3f46]" />
        )}
      </div>

      {/* Message */}
      <span
        className={`text-sm leading-relaxed ${
          status === "active"
            ? "text-[#f0f0f3]"
            : status === "complete"
              ? "text-[#8a8a96]"
              : "text-[#5a5a66]"
        }`}
      >
        {message}
      </span>
    </div>
  );
}
