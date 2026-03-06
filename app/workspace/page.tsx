"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useAuth, getUserInitials, getUserDisplayName } from "@/modules/auth";
import { useSubscription } from "@/modules/billing";
import { signOut } from "@/lib/auth-client";
import { PromptInput } from "@/components/workspace/PromptInput";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import type { Viewport } from "@/components/workspace/PreviewPane";
import type { GenerationStepData } from "@/components/workspace/GenerationStep";

export default function WorkspacePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { subscription, isLoading: subLoading } = useSubscription();

  const [pendingPrompt] = useState(() => {
    if (typeof window === "undefined") return "";
    const stored = sessionStorage.getItem("pendingPrompt");
    if (stored) sessionStorage.removeItem("pendingPrompt");
    return stored ?? "";
  });

  const [portfolioTitle, setPortfolioTitle] = useState("Untitled Portfolio");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  const planLabel = subscription?.plan ?? "FREE";

  // ---- Generation state ----

  const [isGenerating, setIsGenerating] = useState(false);
  const [steps, setSteps] = useState<GenerationStepData[]>([]);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [mobileTab, setMobileTab] = useState<"reasoning" | "preview">(
    "reasoning",
  );

  // ---- Inline title editing ----

  const startEditingTitle = useCallback(() => {
    setIsEditingTitle(true);
    requestAnimationFrame(() => {
      titleInputRef.current?.select();
    });
  }, []);

  const commitTitle = useCallback(() => {
    setIsEditingTitle(false);
    if (!portfolioTitle.trim()) {
      setPortfolioTitle("Untitled Portfolio");
    }
  }, [portfolioTitle]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitTitle();
      }
      if (e.key === "Escape") {
        setPortfolioTitle("Untitled Portfolio");
        setIsEditingTitle(false);
      }
    },
    [commitTitle],
  );

  // ---- Close avatar menu on outside click ----

  useEffect(() => {
    if (!avatarMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(e.target as Node)
      ) {
        setAvatarMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [avatarMenuOpen]);

  // ---- Prompt submit ----

  const handlePromptSubmit = useCallback(
    (text: string, _files: File[]) => {
      if (isGenerating) return;
      setIsGenerating(true);
      setSteps([
        { id: 1, message: "Analyzing requirements...", status: "complete" },
        { id: 2, message: "Selecting layout...", status: "active" },
        { id: 3, message: "Generating hero section...", status: "pending" },
        { id: 4, message: "Creating project cards...", status: "pending" },
      ]);
    },
    [isGenerating],
  );

  // ---- Loading state ----

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0b]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#27272a] border-t-[#7c3aed]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0b] text-[#f0f0f3]">
      {/* ================================================================= */}
      {/* Top Bar (64px)                                                     */}
      {/* ================================================================= */}
      <header className="flex h-16 shrink-0 items-center border-b border-[#1a1a1f] px-4">
        {/* ---- Left: Logo ---- */}
        <Link href="/workspace" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <svg
              width="14"
              height="14"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="2"
                width="9"
                height="12"
                rx="1.5"
                fill="white"
                opacity="0.4"
              />
              <rect
                x="6"
                y="5"
                width="9"
                height="12"
                rx="1.5"
                fill="white"
                opacity="0.7"
              />
              <rect
                x="9"
                y="8"
                width="9"
                height="12"
                rx="1.5"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Smartfolio
          </span>
        </Link>

        {/* ---- Center: Portfolio Title (editable) ---- */}
        <div className="flex flex-1 justify-center">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={portfolioTitle}
              onChange={(e) => setPortfolioTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={handleTitleKeyDown}
              maxLength={60}
              className="w-56 rounded-md border border-[#27272a] bg-[#111113] px-2 py-1 text-center text-sm font-medium text-[#f0f0f3] outline-none focus:border-[#7c3aed] sm:w-72"
            />
          ) : (
            <button
              type="button"
              onClick={startEditingTitle}
              className="group flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-[#8a8a96] transition-colors hover:text-[#f0f0f3]"
            >
              <span>{portfolioTitle}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <path
                  d="M8.5 1.5l2 2M1.5 8.5l5-5 2 2-5 5H1.5v-2z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* ---- Right: Plan / Upgrade / Publish / Avatar ---- */}
        <div className="flex items-center gap-2">
          {/* Plan indicator */}
          <span className="hidden rounded-md border border-[#27272a] px-2 py-0.5 text-xs font-medium text-[#5a5a66] sm:inline-block">
            {planLabel}
          </span>

          {/* Upgrade button */}
          {planLabel === "FREE" && (
            <Link
              href="/pricing"
              className="hidden rounded-md bg-[#7c3aed]/10 px-2.5 py-1 text-xs font-medium text-[#7c3aed] transition-colors hover:bg-[#7c3aed]/20 sm:inline-block"
            >
              Upgrade
            </Link>
          )}

          {/* Publish button (disabled in initial state) */}
          <button
            type="button"
            disabled
            className="rounded-lg bg-[#7c3aed] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#6d28d9] disabled:opacity-40 disabled:cursor-not-allowed sm:px-4 sm:text-sm"
          >
            Publish
          </button>

          {/* Separator */}
          <div className="mx-1 hidden h-5 w-px bg-[#1a1a1f] sm:block" />

          {/* User avatar dropdown */}
          <div className="relative" ref={avatarMenuRef}>
            <button
              type="button"
              onClick={() => setAvatarMenuOpen((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a1f] text-xs font-medium text-[#8a8a96] transition-colors hover:bg-[#222228] hover:text-[#f0f0f3]"
              aria-label="User menu"
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                getUserInitials(user as Parameters<typeof getUserInitials>[0])
              )}
            </button>

            {avatarMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-[#27272a] bg-[#111113] py-1 shadow-xl">
                {/* User info */}
                <div className="border-b border-[#1a1a1f] px-3 py-2.5">
                  <p className="text-sm font-medium text-[#f0f0f3]">
                    {getUserDisplayName(
                      user as Parameters<typeof getUserDisplayName>[0],
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-[#5a5a66] truncate">
                    {user?.email}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link
                    href="/pricing"
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex w-full items-center px-3 py-2 text-sm text-[#8a8a96] transition-colors hover:bg-[#1a1a1f] hover:text-[#f0f0f3]"
                  >
                    Billing
                  </Link>
                </div>

                {/* Sign out */}
                <div className="border-t border-[#1a1a1f] py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarMenuOpen(false);
                      signOut().then(() => {
                        window.location.href = "/";
                      });
                    }}
                    className="flex w-full items-center px-3 py-2 text-sm text-[#8a8a96] transition-colors hover:bg-[#1a1a1f] hover:text-[#f0f0f3]"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================================================================= */}
      {/* Main Content                                                        */}
      {/* ================================================================= */}
      <main className="relative flex flex-1 flex-col overflow-hidden">
        {!isGenerating ? (
          /* ---------- State 1: Idle (centered prompt) ---------- */
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            {/* Background glow */}
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
            >
              <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-[#7c3aed]/8 blur-[120px]" />
            </div>

            {/* Heading */}
            <div className="relative z-10 mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-[#f0f0f3] sm:text-3xl">
                What do you want to build?
              </h1>
              <p className="mt-2 text-sm text-[#5a5a66] sm:text-base">
                Describe your portfolio and we&apos;ll generate it for you.
              </p>
            </div>

            {/* Prompt input */}
            <div className="relative z-10">
              <PromptInput
                onSubmit={handlePromptSubmit}
                placeholder="Create a sleek dark portfolio for a React developer with project cards, an about section, and a contact form..."
                maxLength={500}
                showVoice
                showAttachments
                initialValue={pendingPrompt}
              />
            </div>

            {/* Suggestions */}
            <div className="relative z-10 mt-6 flex flex-wrap justify-center gap-2">
              {[
                "Minimalist dark developer portfolio",
                "Creative designer portfolio with animations",
                "Professional fullstack engineer portfolio",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    handlePromptSubmit(suggestion, []);
                  }}
                  className="rounded-lg border border-[#27272a] bg-[#111113] px-3 py-1.5 text-xs text-[#5a5a66] transition-colors hover:border-[#3f3f46] hover:text-[#8a8a96]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ---------- State 2: Active Generation ---------- */
          <WorkspaceLayout
            steps={steps}
            viewport={viewport}
            onViewportChange={setViewport}
            mobileTab={mobileTab}
            onMobileTabChange={setMobileTab}
          >
            <PromptInput
              onSubmit={handlePromptSubmit}
              placeholder="Refine your portfolio..."
              maxLength={500}
              showVoice={false}
              showAttachments={false}
              disabled={isGenerating}
            />
          </WorkspaceLayout>
        )}
      </main>
    </div>
  );
}
