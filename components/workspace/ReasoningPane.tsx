"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { GenerationStep, type GenerationStepData } from "./GenerationStep";

interface ReasoningPaneProps {
  steps: GenerationStepData[];
  children: ReactNode;
}

export function ReasoningPane({ steps, children }: ReasoningPaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new steps arrive
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [steps]);

  return (
    <div className="flex h-full flex-col">
      {/* Scrollable steps list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {steps.map((step) => (
          <GenerationStep key={step.id} {...step} />
        ))}
      </div>

      {/* Fixed bottom: PromptInput slot */}
      <div className="shrink-0 border-t border-[#1a1a1f] p-4">
        {children}
      </div>
    </div>
  );
}
