"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth, getUserInitials, getUserDisplayName } from "@/modules/auth";
import { useSubscription } from "@/modules/billing";
import { signOut } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc-provider";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import { PromptInput } from "@/components/workspace/PromptInput";
import type { Viewport } from "@/components/workspace/PreviewPane";
import type { GenerationStepData } from "@/components/workspace/GenerationStep";

const INITIAL_STEPS: GenerationStepData[] = [
  { id: 1, message: "Analyzing requirements...", status: "active" },
  { id: 2, message: "Selecting layout...", status: "pending" },
  { id: 3, message: "Generating hero section...", status: "pending" },
  { id: 4, message: "Creating project cards...", status: "pending" },
];

export default function ProjectPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const { user, isLoading: authLoading } = useAuth();
  const { subscription } = useSubscription();
  const planLabel = subscription?.plan ?? "FREE";

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  // ---- Generation UI state ----
  const [steps, setSteps] = useState<GenerationStepData[]>(INITIAL_STEPS);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [mobileTab, setMobileTab] = useState<"reasoning" | "preview">(
    "reasoning",
  );

  // ---- Fetch portfolio (polls every 2s) ----
  const { data: portfolio, isLoading: portfolioLoading } =
    trpc.portfolio.getById.useQuery(
      { id },
      { enabled: !!id, refetchInterval: 2000 },
    );

  const completeGeneration = trpc.portfolio.completeGeneration.useMutation();

  // ---- Generation simulation ----
  const simulationStarted = useRef(false);

  useEffect(() => {
    if (portfolio?.status !== "GENERATING" || simulationStarted.current) return;
    simulationStarted.current = true;

    const timers = [
      setTimeout(() => {
        setSteps([
          { id: 1, message: "Analyzing requirements...", status: "complete" },
          { id: 2, message: "Selecting layout...", status: "active" },
          { id: 3, message: "Generating hero section...", status: "pending" },
          { id: 4, message: "Creating project cards...", status: "pending" },
        ]);
      }, 2000),
      setTimeout(() => {
        setSteps([
          { id: 1, message: "Analyzing requirements...", status: "complete" },
          { id: 2, message: "Selecting layout...", status: "complete" },
          { id: 3, message: "Generating hero section...", status: "active" },
          { id: 4, message: "Creating project cards...", status: "pending" },
        ]);
      }, 4000),
      setTimeout(() => {
        setSteps([
          { id: 1, message: "Analyzing requirements...", status: "complete" },
          { id: 2, message: "Selecting layout...", status: "complete" },
          { id: 3, message: "Generating hero section...", status: "complete" },
          { id: 4, message: "Creating project cards...", status: "active" },
        ]);
      }, 6000),
      setTimeout(() => {
        setSteps([
          { id: 1, message: "Analyzing requirements...", status: "complete" },
          { id: 2, message: "Selecting layout...", status: "complete" },
          { id: 3, message: "Generating hero section...", status: "complete" },
          { id: 4, message: "Creating project cards...", status: "complete" },
        ]);
        completeGeneration.mutate({ id });
      }, 7500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [portfolio?.status, id, completeGeneration]);

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

  // ---- Loading state ----
  if (authLoading || portfolioLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0b]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#27272a] border-t-[#7c3aed]" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-[#0a0a0b] text-[#f0f0f3]">
        <p className="text-sm text-[#8a8a96]">Portfolio not found.</p>
        <Link
          href="/workspace"
          className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#6d28d9]"
        >
          Back to Workspace
        </Link>
      </div>
    );
  }

  const isGenerating = portfolio.status === "GENERATING";

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0b] text-[#f0f0f3]">
      {/* ================================================================= */}
      {/* Top Bar                                                            */}
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
              <rect x="3" y="2" width="9" height="12" rx="1.5" fill="white" opacity="0.4" />
              <rect x="6" y="5" width="9" height="12" rx="1.5" fill="white" opacity="0.7" />
              <rect x="9" y="8" width="9" height="12" rx="1.5" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Smartfolio
          </span>
        </Link>

        {/* ---- Center: Portfolio Title ---- */}
        <div className="flex flex-1 justify-center">
          <span className="text-sm font-medium text-[#8a8a96]">
            {portfolio.title}
          </span>
        </div>

        {/* ---- Right: Plan / Upgrade / Publish / Avatar ---- */}
        <div className="flex items-center gap-2">
          <span className="hidden rounded-md border border-[#27272a] px-2 py-0.5 text-xs font-medium text-[#5a5a66] sm:inline-block">
            {planLabel}
          </span>

          {planLabel === "FREE" && (
            <Link
              href="/pricing"
              className="hidden rounded-md bg-[#7c3aed]/10 px-2.5 py-1 text-xs font-medium text-[#7c3aed] transition-colors hover:bg-[#7c3aed]/20 sm:inline-block"
            >
              Upgrade
            </Link>
          )}

          <button
            type="button"
            disabled={isGenerating}
            className="rounded-lg bg-[#7c3aed] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#6d28d9] disabled:opacity-40 disabled:cursor-not-allowed sm:px-4 sm:text-sm"
          >
            Publish
          </button>

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
                <div className="py-1">
                  <Link
                    href="/pricing"
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex w-full items-center px-3 py-2 text-sm text-[#8a8a96] transition-colors hover:bg-[#1a1a1f] hover:text-[#f0f0f3]"
                  >
                    Billing
                  </Link>
                </div>
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
        {isGenerating ? (
          /* ---------- GENERATING: workspace with reasoning + preview ---------- */
          <WorkspaceLayout
            steps={steps}
            viewport={viewport}
            onViewportChange={setViewport}
            mobileTab={mobileTab}
            onMobileTabChange={setMobileTab}
          >
            <PromptInput
              onSubmit={() => {}}
              placeholder="Refine your portfolio..."
              maxLength={500}
              showVoice={false}
              showAttachments={false}
              disabled
            />
          </WorkspaceLayout>
        ) : (
          /* ---------- READY: portfolio editor placeholder ---------- */
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
            >
              <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-[#7c3aed]/8 blur-[120px]" />
            </div>

            <div className="relative z-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#7c3aed]/10">
                <svg
                  width="24"
                  height="24"
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
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-[#f0f0f3]">
                Portfolio Ready
              </h2>
              <p className="mt-2 text-sm text-[#5a5a66]">
                Your portfolio &ldquo;{portfolio.title}&rdquo; has been
                generated. The editor will appear here.
              </p>
              <Link
                href="/workspace"
                className="mt-6 inline-block rounded-lg border border-[#27272a] px-4 py-2 text-sm font-medium text-[#8a8a96] transition-colors hover:border-[#3f3f46] hover:text-[#f0f0f3]"
              >
                Back to Workspace
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
