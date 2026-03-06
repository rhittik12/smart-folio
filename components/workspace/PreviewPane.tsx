"use client";

import { useState } from "react";

export type Viewport = "desktop" | "tablet" | "mobile";

interface PreviewPaneProps {
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
  showViewportToggle?: boolean;
}

const PLACEHOLDER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background: #0a0a0b;
      color: #8a8a96;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .c { text-align: center; padding: 2rem; }
    h1 { font-size: 1.25rem; color: #f0f0f3; font-weight: 600; margin: 0 0 0.5rem; }
    p { font-size: 0.875rem; margin: 0; }
  </style>
</head>
<body>
  <div class="c">
    <h1>Preview will appear here</h1>
    <p>Your portfolio is being generated&hellip;</p>
  </div>
</body>
</html>`;

const VIEWPORT_WIDTHS: Record<Viewport, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

const VIEWPORT_OPTIONS: { value: Viewport; label: string }[] = [
  { value: "desktop", label: "Desktop" },
  { value: "tablet", label: "Tablet" },
  { value: "mobile", label: "Mobile" },
];

export function PreviewPane({
  viewport,
  onViewportChange,
  showViewportToggle = true,
}: PreviewPaneProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <div className="flex h-full flex-col">
      {/* Viewport toggle bar */}
      {showViewportToggle && (
        <div className="flex items-center justify-center gap-1 border-b border-[#1a1a1f] px-4 py-2">
          {VIEWPORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => onViewportChange(value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                viewport === value
                  ? "bg-[#27272a] text-[#f0f0f3]"
                  : "text-[#5a5a66] hover:text-[#8a8a96]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Preview container */}
      <div className="flex flex-1 items-start justify-center overflow-auto bg-[#0a0a0b] p-4">
        <div
          className="relative h-full transition-[width] duration-300 ease-in-out"
          style={{
            width: VIEWPORT_WIDTHS[viewport],
            maxWidth: "100%",
          }}
        >
          {/* Loading skeleton */}
          {!iframeLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-md space-y-4 px-8">
                <div className="h-8 w-3/4 animate-pulse rounded bg-[#1a1a1f]" />
                <div className="h-4 w-full animate-pulse rounded bg-[#1a1a1f]" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-[#1a1a1f]" />
                <div className="h-32 w-full animate-pulse rounded bg-[#1a1a1f]" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-[#1a1a1f]" />
              </div>
            </div>
          )}

          <iframe
            title="Portfolio preview"
            srcDoc={PLACEHOLDER_HTML}
            sandbox="allow-scripts allow-same-origin"
            onLoad={() => setIframeLoaded(true)}
            className={`h-full w-full rounded-lg border border-[#27272a] bg-[#0a0a0b] transition-opacity duration-300 ${
              iframeLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
