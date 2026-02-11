import Link from "next/link";

export default function Home() {
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
          Create stunning developer and designer portfolios with AI — in
          minutes.
        </p>

        {/* Prompt Input Box */}
        <div className="mt-10 w-full max-w-2xl sm:mt-14">
          <div className="rounded-2xl border border-white/10 bg-gray-900/80 p-4 shadow-2xl shadow-indigo-500/5 backdrop-blur-sm sm:rounded-3xl sm:p-6">
            {/* Placeholder text area */}
            <p className="min-h-[60px] text-sm text-gray-500 sm:min-h-[80px] sm:text-base">
              Ask Smartfolio to create a portfolio for a frontend developer...
            </p>

            {/* Bottom action bar */}
            <div className="mt-3 flex items-center justify-between sm:mt-4">
              {/* Left: Attach */}
              <button
                type="button"
                aria-label="Attach file"
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

              {/* Right: Plan, Voice, Send */}
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs text-gray-500 sm:text-sm">Plan</span>

                {/* Voice icon */}
                <button
                  type="button"
                  aria-label="Voice input"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-white"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="5.5"
                      y="1"
                      width="5"
                      height="8"
                      rx="2.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
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
