"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const MAX_WORDS = 500;

function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

function truncateToWordLimit(text: string, limit: number): string {
  let wordCount = 0;
  let inWord = false;
  for (let i = 0; i < text.length; i++) {
    const isWhitespace = /\s/.test(text[i]);
    if (!isWhitespace && !inWord) {
      wordCount++;
      if (wordCount > limit) {
        return text.slice(0, i);
      }
    }
    inWord = !isWhitespace;
  }
  return text;
}

interface SpeechResultEvent {
  results: {
    length: number;
    [index: number]: { 0: { transcript: string }; isFinal: boolean };
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionInstance) | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as
    | (new () => SpeechRecognitionInstance)
    | undefined;
}

export default function Home() {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"signup" | "login">("signup");
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseTextRef = useRef("");
  const textRef = useRef(text);
  textRef.current = text;
  const searchParams = useSearchParams();

  const wordCount = countWords(text);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 400)}px`;
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let value = e.target.value;
      if (countWords(value) > MAX_WORDS) {
        value = truncateToWordLimit(value, MAX_WORDS);
      }
      setText(value);
      requestAnimationFrame(() => autoResize());
    },
    [autoResize],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
        e.target.value = "";
      }
    },
    [],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsRecording(false);
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    baseTextRef.current = textRef.current;

    recognition.onresult = (event: SpeechResultEvent) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      const base = baseTextRef.current;
      let combined = base + (base ? " " : "") + transcript;

      if (countWords(combined) > MAX_WORDS) {
        combined = truncateToWordLimit(combined, MAX_WORDS);
      }

      setText(combined);
      requestAnimationFrame(() => autoResize());
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        setIsRecording(false);
        recognitionRef.current = null;
      }
    };

    recognition.onerror = () => {
      if (recognitionRef.current === recognition) {
        setIsRecording(false);
        recognitionRef.current = null;
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording, autoResize]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const openModal = useCallback((mode: "signup" | "login") => {
    setModalMode(mode);
    setSocialError(null);
    setSocialLoading(null);
    setIsModalOpen(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsModalVisible(true);
      });
    });
  }, []);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setTimeout(() => setIsModalOpen(false), 200);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, closeModal]);

  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam === "login" || authParam === "signup") {
      openModal(authParam);
    }
  }, [searchParams, openModal]);

  const handleSocialSignIn = useCallback(async (provider: "google" | "github") => {
    if (socialLoading) return;
    setSocialError(null);
    setSocialLoading(provider);
    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/";
      await authClient.signIn.social({
        provider,
        callbackURL: callbackUrl,
      });
    } catch {
      setSocialError("Something went wrong. Please try again.");
      setSocialLoading(null);
    }
  }, [searchParams, socialLoading]);

  return (
    <div className="relative min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-indigo-500/15 blur-[128px]" />
        <div className="absolute left-[15%] top-[10%] h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="absolute right-[10%] top-[15%] h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-pink-500/5 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-gray-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <svg
                width="18"
                height="18"
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
            <span className="text-lg font-semibold tracking-tight">
              Smartfolio
            </span>
          </Link>

          {/* Right: Nav items */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/pricing"
              className="px-2 text-sm text-gray-400 transition-colors hover:text-white"
            >
              Pricing
            </Link>
            <button
              type="button"
              onClick={() => openModal("login")}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:border-white/20 hover:text-white sm:px-4 sm:py-2"
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => openModal("signup")}
              className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-950 transition-colors hover:bg-gray-200 sm:px-4 sm:py-2"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex min-h-[calc(100vh-73px)] flex-col items-center justify-center px-4 sm:px-6">
        {/* Heading */}
        <h1 className="max-w-4xl text-center text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Build a Portfolio That
          <br />
          Gets You Hired
        </h1>

        {/* Subheading */}
        <p className="mt-5 max-w-xl text-center text-base text-gray-400 sm:mt-6 sm:text-lg md:text-xl">
          Create stunning portfolios in minutes.
        </p>

        {/* Prompt Input Box */}
        <div className="mt-10 w-full max-w-2xl sm:mt-14">
          <div className="rounded-2xl border border-white/10 bg-gray-900/80 p-4 shadow-2xl shadow-indigo-500/5 backdrop-blur-sm sm:rounded-3xl sm:p-6">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleChange}
              placeholder="Ask Smartfolio to create a portfolio for a frontend developer..."
              rows={4}
              className="w-full min-h-[120px] max-h-[400px] resize-none overflow-y-auto bg-transparent text-sm leading-relaxed text-white placeholder-gray-500 outline-none sm:text-base"
            />

            {/* Attached files */}
            {files.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {files.map((file, i) => (
                  <div
                    key={`${file.name}-${file.size}-${i}`}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                      className="shrink-0 text-gray-500"
                    >
                      <path
                        d="M2 1.5A1.5 1.5 0 0 1 3.5 0h3.379a1.5 1.5 0 0 1 1.06.44l2.122 2.12A1.5 1.5 0 0 1 10.5 3.622V10.5A1.5 1.5 0 0 1 9 12H3.5A1.5 1.5 0 0 1 2 10.5V1.5Z"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                    </svg>
                    <span className="max-w-[120px] truncate sm:max-w-[180px]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label={`Remove ${file.name}`}
                      className="ml-0.5 shrink-0 text-gray-500 transition-colors hover:text-white"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M3 3l6 6M9 3l-6 6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom action bar */}
            <div className="mt-3 flex items-center justify-between sm:mt-4">
              {/* Left: Attach */}
              <div className="flex items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  tabIndex={-1}
                />
                <button
                  type="button"
                  aria-label="Attach file"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-gray-400 transition-colors hover:border-white/20 hover:text-white"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M8 3v10M3 8h10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Right: Word count, Plan, Voice, Send */}
              <div className="flex items-center gap-2 sm:gap-3">
                <span
                  className={`text-xs tabular-nums sm:text-sm ${
                    wordCount >= MAX_WORDS ? "text-red-400" : "text-gray-500"
                  }`}
                >
                  {wordCount} / {MAX_WORDS} words
                </span>

                <div className="h-4 w-px bg-white/10" />

                <span className="text-xs text-gray-500 sm:text-sm">Plan</span>

                {/* Voice icon */}
                <button
                  type="button"
                  aria-label={isRecording ? "Stop recording" : "Voice input"}
                  onClick={toggleRecording}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    isRecording
                      ? "text-red-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {isRecording && (
                    <span className="absolute inset-0 animate-ping rounded-lg bg-red-500/20" />
                  )}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    className="relative"
                  >
                    <rect
                      x="5.5"
                      y="1"
                      width="5"
                      height="8"
                      rx="2.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className={isRecording ? "fill-red-400/30" : ""}
                    />
                    <path
                      d="M3 7a5 5 0 0 0 10 0"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8 12v2.5M6 14.5h4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                {/* Send button */}
                <button
                  type="button"
                  aria-label="Send message"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-950 transition-colors hover:bg-gray-200"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M8 12V4m0 0L4.5 7.5M8 4l3.5 3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {isModalOpen && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-sm transition-colors duration-200 ${
            isModalVisible ? "bg-black/60" : "bg-black/0"
          }`}
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={modalMode === "login" ? "Log in" : "Sign up"}
            className={`w-full max-w-md rounded-2xl bg-neutral-900 p-6 shadow-2xl transition-all duration-200 sm:p-8 ${
              isModalVisible
                ? "scale-100 opacity-100"
                : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="flex justify-end">
              <button
                type="button"
                aria-label="Close"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-white"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Logo + Heading */}
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <svg
                  width="26"
                  height="26"
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

              <h2 className="mt-6 text-2xl font-bold tracking-tight">
                Start Building.
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                {modalMode === "login"
                  ? "Log in to your account"
                  : "Create your free account"}
              </p>
            </div>

            {/* OAuth Buttons */}
            <div className="mt-8 space-y-3">
              {socialError && (
                <p className="text-center text-sm text-red-400">{socialError}</p>
              )}
              <button
                type="button"
                disabled={socialLoading !== null}
                onClick={() => handleSocialSignIn("google")}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-50"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {socialLoading === "google" ? "Connecting..." : "Continue with Google"}
              </button>

              <button
                type="button"
                disabled={socialLoading !== null}
                onClick={() => handleSocialSignIn("github")}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:pointer-events-none disabled:opacity-50"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                {socialLoading === "github" ? "Connecting..." : "Continue with GitHub"}
              </button>
            </div>

            {/* Terms */}
            <p className="mt-6 text-center text-xs leading-relaxed text-gray-500">
              By continuing, you agree to the{" "}
              <span className="text-gray-400 underline underline-offset-2">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-gray-400 underline underline-offset-2">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
