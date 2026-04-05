import { Link, Navigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Search,
  MessageSquareText,
  Sprout,
  FileCheck2,
  BarChart3,
} from "lucide-react";
import heroImg from "../assets/hero.jpg";
import { isAuthenticated } from "../utils/auth";

const processSteps = [
  {
    title: "Share Practice",
    text: "Farmers and contributors document a method with field context, materials, and steps.",
    icon: Sprout,
  },
  {
    title: "Community Discussion",
    text: "Questions, clarifications, and field notes refine the practice before trust grows.",
    icon: MessageSquareText,
  },
  {
    title: "Outcome Reports",
    text: "People report whether the method was effective, partial, or ineffective in similar contexts.",
    icon: FileCheck2,
  },
  {
    title: "Trust Building",
    text: "Scores and confidence rise as validated evidence accumulates around the practice and contributor.",
    icon: BarChart3,
  },
];

export default function LandingPage() {
  if (isAuthenticated()) return <Navigate to="/app" replace />;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_28%),linear-gradient(180deg,#f7f8f2_0%,#eef2e7_100%)] text-slate-900">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div>
          <p className="font-brand text-lg font-semibold tracking-wide">CKVS</p>
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-700/75">
            Community knowledge validation
          </p>
        </div>

        <nav className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white/70"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-700"
          >
            Register
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-10">
        <section className="grid gap-10 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/90 px-4 py-2 text-sm text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Agricultural knowledge, validated by real outcomes
            </div>

            <div className="space-y-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700/75">
                Editorial Knowledge System
              </p>
              <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Preserve local practice.
                <span className="block text-emerald-600">Make trust visible.</span>
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600">
                CKVS helps communities document agricultural practices, debate
                them in context, report real outcomes, and steadily build a
                shared evidence base around what truly works.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-700"
              >
                Join the community <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-white"
              >
                Sign in
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border-l-2 border-emerald-500 pl-4">
                <p className="text-sm font-semibold">120+</p>
                <p className="mt-1 text-sm text-slate-600">Practices captured and contextualized.</p>
              </div>
              <div className="border-l-2 border-emerald-500 pl-4">
                <p className="text-sm font-semibold">350+</p>
                <p className="mt-1 text-sm text-slate-600">Outcome reports shaping confidence.</p>
              </div>
              <div className="border-l-2 border-emerald-500 pl-4">
                <p className="text-sm font-semibold">60+</p>
                <p className="mt-1 text-sm text-slate-600">Contributors building credibility over time.</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="overflow-hidden rounded-[34px] border border-white/70 bg-white/75 shadow-sm">
              <div className="relative h-[420px]">
                <img src={heroImg} alt="Agricultural community" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100/80">
                    Living knowledge board
                  </p>
                  <p className="mt-3 font-heading text-2xl font-semibold">
                    Turning field experience into a trusted community record.
                  </p>
                  <p className="mt-2 max-w-md text-sm leading-7 text-white/80">
                    Record the method, test it in practice, and let the outcome
                    trail strengthen or weaken trust.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-sm">
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
                <h3 className="mt-4 font-heading text-xl font-semibold">Validation-first</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Practices gain standing from documented results, not just likes
                  or popularity.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-sm">
                <Search className="h-5 w-5 text-emerald-700" />
                <h3 className="mt-4 font-heading text-xl font-semibold">Context-aware discovery</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Filter by crop, problem, season, and location to find what fits
                  the field conditions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[36px] border border-emerald-900/10 bg-[linear-gradient(180deg,rgba(218,245,231,0.92),rgba(247,248,242,0.98))] p-6 shadow-sm sm:p-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700/75">
              Validation Workflow
            </p>
            <h2 className="mt-3 font-heading text-3xl font-semibold">
              Share Practice → Community Discussion → Outcome Reports → Trust Building
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The platform is designed around the lifecycle of local knowledge:
              capture it, test it, discuss it, and show evidence clearly enough
              for communities to keep what works.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.title}
                  className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-emerald-700" />
                    <span className="text-xs font-semibold text-slate-400">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 font-heading text-xl font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{step.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} CKVS · HND Software Engineering Project
        </footer>
      </main>
    </div>
  );
}
