"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// ---------------------------------------------------------------------------
// Word-count helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Speech recognition types
// ---------------------------------------------------------------------------

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

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognitionInstance)
  | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as
    | (new () => SpeechRecognitionInstance)
    | undefined;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface PromptInputProps {
  onSubmit: (text: string, files: File[]) => void;
  placeholder?: string;
  maxLength?: number;
  showVoice?: boolean;
  showAttachments?: boolean;
  disabled?: boolean;
  initialValue?: string;
}

export function PromptInput({
  onSubmit,
  placeholder = "Describe the portfolio you want to create...",
  maxLength = 500,
  showVoice = true,
  showAttachments = true,
  disabled = false,
  initialValue = "",
}: PromptInputProps) {
  const [text, setText] = useState(initialValue);
  const [files, setFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseTextRef = useRef("");
  const textRef = useRef(text);
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  const wordCount = countWords(text);

  // ---- Auto-resize textarea ----

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 400)}px`;
  }, []);

  // Resize on mount to fit initialValue
  useEffect(() => {
    autoResize();
  }, [autoResize]);

  // ---- Text change ----

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let value = e.target.value;
      if (countWords(value) > maxLength) {
        value = truncateToWordLimit(value, maxLength);
      }
      setText(value);
      requestAnimationFrame(() => autoResize());
    },
    [autoResize, maxLength],
  );

  // ---- File handling ----

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

  // ---- Voice recording ----

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
      if (countWords(combined) > maxLength) {
        combined = truncateToWordLimit(combined, maxLength);
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
  }, [isRecording, autoResize, maxLength]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  // ---- Submit ----

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed, files);
    setText("");
    setFiles([]);
    requestAnimationFrame(() => autoResize());
  }, [text, files, disabled, onSubmit, autoResize]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  // ---- Render ----

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-2xl border border-[#27272a] bg-[#111113] p-4 shadow-2xl shadow-purple-500/5 sm:rounded-3xl sm:p-6">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={4}
          className="w-full min-h-[120px] max-h-[400px] resize-none overflow-y-auto bg-transparent text-sm leading-relaxed text-[#f0f0f3] placeholder-[#5a5a66] outline-none disabled:opacity-50 sm:text-base"
        />

        {/* Attached files */}
        {files.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${file.size}-${i}`}
                className="flex items-center gap-1.5 rounded-lg border border-[#27272a] bg-white/5 px-3 py-1.5 text-xs text-[#8a8a96]"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  className="shrink-0 text-[#5a5a66]"
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
                  className="ml-0.5 shrink-0 text-[#5a5a66] transition-colors hover:text-[#f0f0f3]"
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
            {showAttachments && (
              <>
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
                  disabled={disabled}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#27272a] text-[#8a8a96] transition-colors hover:border-[#3f3f46] hover:text-[#f0f0f3] disabled:opacity-50"
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
              </>
            )}
          </div>

          {/* Right: Word count, Voice, Send */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className={`text-xs tabular-nums sm:text-sm ${wordCount >= maxLength ? "text-red-400" : "text-[#5a5a66]"
                }`}
            >
              {wordCount} / {maxLength} words
            </span>

            {/* Voice icon */}
            {showVoice && (
              <>
                <div className="h-4 w-px bg-[#27272a]" />
                <button
                  type="button"
                  aria-label={isRecording ? "Stop recording" : "Voice input"}
                  onClick={toggleRecording}
                  disabled={disabled}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${isRecording
                      ? "text-red-400"
                      : "text-[#8a8a96] hover:text-[#f0f0f3]"
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
              </>
            )}

            {/* Send button */}
            <button
              type="button"
              aria-label="Send message"
              onClick={handleSubmit}
              disabled={disabled || !text.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7c3aed] text-white transition-colors hover:bg-[#6d28d9] disabled:opacity-40 disabled:hover:bg-[#7c3aed]"
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
  );
}
