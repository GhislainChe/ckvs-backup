import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/api";
import defaultPracticeImg from "../../assets/practice-default.jpg";
import { buildImageUrl } from "../../utils/media";
import { CheckCircle2, Flag, MessageSquareText, BookmarkPlus, ShieldCheck } from "lucide-react";
import ReportModal from "../../components/ReportModal";

function parseList(value) {
  return String(value || "")
    .split(/\r?\n+/)
    .map((item) => item.replace(/^\d+[\).\s-]*/, "").trim())
    .filter(Boolean);
}

function trustState(practice, statValues) {
  if ((practice?.confidenceLevel || "").toUpperCase() === "HIGH" && statValues.totalReports >= 5) {
    return "Well validated";
  }
  if ((practice?.confidenceLevel || "").toUpperCase() === "MEDIUM" || statValues.totalReports >= 2) {
    return "Growing evidence";
  }
  return "Early evidence";
}

export default function PracticeDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [reportOpen, setReportOpen] = useState(false);
  const practiceId = Number(id);

  const [practice, setPractice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");
  const [isApplied, setIsApplied] = useState(false);

  const statValues = useMemo(
    () => ({
      totalReports: stats?.totalReports ?? practice?.stats?.outcomes?.validReports ?? 0,
      effective: stats?.effective ?? 0,
      partial: stats?.partial ?? 0,
      ineffective: stats?.ineffective ?? 0,
      recommendedRate: stats?.recommendedRate ?? 0,
      comments: practice?.stats?.comments?.visibleComments ?? 0,
    }),
    [practice, stats],
  );

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true);
        setError("");

        if (!Number.isInteger(practiceId) || practiceId <= 0) {
          setError("Invalid practice id");
          return;
        }

        const [practiceRes, statsRes, appliedRes] = await Promise.all([
          api.get(`/practices/${practiceId}`),
          api.get(`/practices/${practiceId}/stats`),
          api.get(`/practices/applied`),
        ]);

        const data = practiceRes.data?.practice ? practiceRes.data.practice : practiceRes.data;
        setPractice(data);
        setStats(statsRes.data);

        const appliedList = Array.isArray(appliedRes.data)
          ? appliedRes.data
          : appliedRes.data?.applied || appliedRes.data?.practices || [];

        const alreadyApplied = appliedList.some((item) => {
          const pid = Number(item.practiceId ?? item.id ?? item.practice_id ?? item.practiceID);
          return pid === practiceId;
        });

        setIsApplied(alreadyApplied);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load practice");
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [practiceId]);

  async function handleApply() {
    try {
      setApplyLoading(true);
      setApplyMsg("");
      await api.post(`/practices/${practiceId}/apply`);
      setIsApplied(true);
      setApplyMsg("Saved to Bookmarks.");
    } catch (err) {
      if (err?.response?.status === 409) {
        setIsApplied(true);
        setApplyMsg("Already saved in Bookmarks.");
      } else {
        setApplyMsg(err?.response?.data?.message || "Failed to apply practice");
      }
    } finally {
      setApplyLoading(false);
    }
  }

  if (loading) return <p className="px-3 py-4 text-slate-500 sm:px-4 md:px-6">Loading...</p>;
  if (error) return <p className="px-3 py-4 text-red-600 sm:px-4 md:px-6">{error}</p>;
  if (!practice) return <p className="px-3 py-4 text-slate-500 sm:px-4 md:px-6">Practice not found.</p>;

  const imgSrc = buildImageUrl(practice.imageUrl) || defaultPracticeImg;
  const steps = parseList(practice.steps);
  const materials = parseList(practice.materials);
  const trust = trustState(practice, statValues);

  return (
    <div className="space-y-6 px-3 py-4 sm:px-4 md:px-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_380px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[34px] border border-white/70 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="relative h-[260px] sm:h-[320px]">
              <img src={imgSrc} alt={practice.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100/80">
                  Validation Record
                </p>
                <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">
                  {practice.title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">
                  {practice.description || "Community practice shared with context and implementation guidance."}
                </p>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300/60">
                  Context
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                    Crop: {practice.cropType || "Not specified"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                    Problem: {practice.problemType || "Not specified"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                    Season: {practice.season || "Not specified"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                    Location: {practice.location || "Not specified"}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300/60">
                  Contributor
                </p>
                <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">
                  {practice.author?.fullName || "Community member"}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300/75">
                  Credibility score {Number(practice.author?.credibilityScore || 0).toFixed(0)} • {practice.author?.role || "USER"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <section className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700/75 dark:text-emerald-200/70">
                Overview
              </p>
              <h2 className="mt-2 font-heading text-2xl font-semibold">What this practice does</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300/75">
                {practice.overview || practice.description || "Overview content will appear here."}
              </p>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300/60">
                  Materials
                </p>
                <h3 className="mt-2 font-heading text-2xl font-semibold">What is needed</h3>
                {materials.length ? (
                  <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300/75">
                    {materials.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-300/75">No materials listed.</p>
                )}
              </div>

              <div className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300/60">
                  Why it works
                </p>
                <h3 className="mt-2 font-heading text-2xl font-semibold">Field context</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300/75">
                  {practice.overview || "Context about why the practice works will appear here."}
                </p>
              </div>
            </section>

            <section className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700/75 dark:text-emerald-200/70">
                Steps
              </p>
              <h2 className="mt-2 font-heading text-2xl font-semibold">How to apply it</h2>
              {steps.length ? (
                <ol className="mt-5 space-y-4">
                  {steps.map((step, index) => (
                    <li key={`${index + 1}-${step}`} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-sm font-semibold text-white">
                        {index + 1}
                      </span>
                      <p className="pt-1 text-sm leading-7 text-slate-600 dark:text-slate-300/75">{step}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300/75">No steps listed.</p>
              )}
            </section>
          </div>
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="space-y-5 rounded-[32px] border border-emerald-900/10 bg-[linear-gradient(180deg,rgba(218,245,231,0.95),rgba(247,248,242,0.98))] p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(10,33,26,0.95),rgba(11,18,32,0.98))] sm:p-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700/75 dark:text-emerald-200/70">
                Validation Panel
              </p>
              <h2 className="mt-2 font-heading text-3xl font-semibold">Credibility at a glance</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300/75">
                This screen brings together outcome evidence, confidence, and moderation state so users can judge whether this practice is trustworthy.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300/60">
                Effectiveness score
              </p>
              <p className="mt-3 text-5xl font-semibold text-slate-900 dark:text-white">
                {practice.effectivenessScore ?? "0.00"}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/75">
                {statValues.recommendedRate}% would recommend this practice.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[24px] border border-white/70 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs text-slate-500 dark:text-slate-300/60">Confidence</p>
                <p className="mt-2 text-xl font-semibold">{practice.confidenceLevel || "LOW"}</p>
              </div>
              <div className="rounded-[24px] border border-white/70 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs text-slate-500 dark:text-slate-300/60">Trust state</p>
                <p className="mt-2 text-xl font-semibold">{trust}</p>
              </div>
              <div className="rounded-[24px] border border-white/70 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs text-slate-500 dark:text-slate-300/60">Reports</p>
                <p className="mt-2 text-xl font-semibold">{statValues.totalReports}</p>
              </div>
              <div className="rounded-[24px] border border-white/70 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs text-slate-500 dark:text-slate-300/60">Comments</p>
                <p className="mt-2 text-xl font-semibold">{statValues.comments}</p>
              </div>
            </div>

            <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/80 p-5 dark:border-emerald-500/15 dark:bg-emerald-500/10">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-200" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Moderation state</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300/75">Visible and eligible for community validation.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {!isApplied ? (
                <button
                  onClick={handleApply}
                  disabled={applyLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  <BookmarkPlus className="h-4 w-4" />
                  {applyLoading ? "Saving..." : "Apply practice"}
                </button>
              ) : (
                <button
                  disabled
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white opacity-90"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Applied
                </button>
              )}

              {isApplied && (
                <button
                  onClick={() => navigate(`/app/practices?submitOutcomeFor=${practiceId}`)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                  Submit outcome
                </button>
              )}

              <button
                onClick={() => navigate(`/app/discussions?practiceId=${practiceId}`)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <MessageSquareText className="h-4 w-4" />
                Open discussion
              </button>

              <button
                onClick={() => setReportOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/15"
              >
                <Flag className="h-4 w-4" />
                Report practice
              </button>
            </div>

            {applyMsg && <p className="text-sm text-slate-600 dark:text-slate-300/75">{applyMsg}</p>}

            <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300/60">
                Outcome mix
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between"><span>Effective</span><span className="font-semibold">{statValues.effective}</span></div>
                <div className="flex items-center justify-between"><span>Partial</span><span className="font-semibold">{statValues.partial}</span></div>
                <div className="flex items-center justify-between"><span>Ineffective</span><span className="font-semibold">{statValues.ineffective}</span></div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="PRACTICE"
        targetId={practiceId}
        title="Report this practice"
        subtitle="If it is spam or misleading, report it so moderators can review."
      />
    </div>
  );
}
