"use client";

import { useState, useEffect, type ReactNode } from "react";
import { ReasoningPane } from "./ReasoningPane";
import { PreviewPane, type Viewport } from "./PreviewPane";
import type { GenerationStepData } from "./GenerationStep";

interface WorkspaceLayoutProps {
  steps: GenerationStepData[];
  viewport: Viewport;
  onViewportChange: (v: Viewport) => void;
  mobileTab: "reasoning" | "preview";
  onMobileTabChange: (tab: "reasoning" | "preview") => void;
  children: ReactNode;
}

export function WorkspaceLayout({
  steps,
  viewport,
  onViewportChange,
  mobileTab,
  onMobileTabChange,
  children,
}: WorkspaceLayoutProps) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setEntered(true);
      });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* ---- Mobile tab bar ---- */}
      <div className="flex shrink-0 border-b border-[#1a1a1f] md:hidden">
        {(["reasoning", "preview"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onMobileTabChange(tab)}
            className={`flex-1 py-2.5 text-center text-sm font-medium capitalize transition-colors ${
              mobileTab === tab
                ? "border-b-2 border-[#7c3aed] text-[#f0f0f3]"
                : "text-[#5a5a66] hover:text-[#8a8a96]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ---- Desktop: two-pane split ---- */}
      <div className="hidden h-full md:flex">
        {/* Left pane: Reasoning */}
        <div
          className={`w-[38%] max-w-[500px] shrink-0 border-r border-[#1a1a1f] transition-all duration-300 ease-in-out ${
            entered
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-8"
          }`}
        >
          <ReasoningPane steps={steps}>{children}</ReasoningPane>
        </div>

        {/* Right pane: Preview */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            entered
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-8"
          }`}
        >
          <PreviewPane
            viewport={viewport}
            onViewportChange={onViewportChange}
          />
        </div>
      </div>

      {/* ---- Mobile: single pane with tabs ---- */}
      <div className="flex-1 overflow-hidden md:hidden">
        {mobileTab === "reasoning" ? (
          <ReasoningPane steps={steps}>{children}</ReasoningPane>
        ) : (
          <PreviewPane
            viewport="mobile"
            onViewportChange={onViewportChange}
            showViewportToggle={false}
          />
        )}
      </div>
    </div>
  );
}
