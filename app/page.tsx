"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseTextRef = useRef("");
  const textRef = useRef(text);
  textRef.current = text;

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
            <Link
              href="/sign-in"
              className="rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:border-white/20 hover:text-white sm:px-4 sm:py-2"
            >
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-950 transition-colors hover:bg-gray-200 sm:px-4 sm:py-2"
            >
              Get started
            </Link>
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
    </div>
  );
}
