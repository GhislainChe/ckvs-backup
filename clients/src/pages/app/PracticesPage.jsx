import { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Plus,
  Search,
} from "lucide-react";
import PracticesGridSkeleton from "../../components/UIskeletons/PracticesGridSkeleton";
import { buildImageUrl } from "../../utils/media";
import defaultPracticeImg from "../../assets/practice-default.jpg";

function fieldClassName() {
  return "mt-1 w-full rounded-2xl border border-slate-200/90 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-emerald-500/15";
}

function confidenceTone(level) {
  const value = String(level || "").toUpperCase();
  if (value === "HIGH") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200";
  if (value === "MEDIUM") return "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200";
  return "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200";
}

function statusTone(status) {
  const value = String(status || "").toUpperCase();
  if (value === "ACTIVE" || value === "VALID") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200";
  if (value === "PENDING") return "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200";
  return "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200";
}

function PracticeRow({ practice, onOpenDetails }) {
  const imgSrc = buildImageUrl(practice.imageUrl) || defaultPracticeImg;
  const confidence = practice.confidenceLevel || "LOW";
  const totalReports = Number(practice.totalReports || 0);
  const metadata = [
    practice.cropName || practice.cropType,
    practice.problemName || practice.problemType,
    practice.season,
    practice.location,
  ].filter(Boolean);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-white/5">
      <div className="grid gap-0 md:grid-cols-[180px_minmax(0,1fr)_160px]">
        <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-white/5 md:h-full">
          <img src={imgSrc} alt={practice.title} className="h-full w-full object-cover" />
        </div>

        <div className="space-y-4 p-5">
          <div>
            <h2 className="font-heading text-xl font-semibold text-slate-900 dark:text-white">
              {practice.title}
            </h2>
          </div>

          <p className="line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300/75">
            {practice.overview || practice.description || "No overview provided for this practice yet."}
          </p>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-300/65">
            {metadata.length ? (
              metadata.map((item) => (
                <span key={item} className="after:ml-3 after:text-slate-300 after:content-['/'] last:after:hidden dark:after:text-slate-600">
                  {item}
                </span>
              ))
            ) : (
              <span>No field metadata provided.</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusTone(practice.status)}`}>
              {practice.status || "ACTIVE"}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${confidenceTone(confidence)}`}>
              {confidence}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-200">
              {totalReports} reports
            </span>
          </div>
        </div>

        <div className="flex items-end justify-start p-5 pt-0 md:justify-end md:p-5">
          <div className="flex w-full md:w-auto">
            <button
              type="button"
              onClick={() => onOpenDetails(practice.practiceId)}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function PracticesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [openPracticeId, setOpenPracticeId] = useState(null);

  const [practices, setPractices] = useState([]);
  const [meta, setMeta] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cropOptions, setCropOptions] = useState([]);
  const [problemOptions, setProblemOptions] = useState([]);
  const [seasonOptions, setSeasonOptions] = useState([]);

  const [filters, setFilters] = useState({
    q: "",
    cropTypeId: "",
    problemTypeId: "",
    season: "",
  });

  const [outcomeType, setOutcomeType] = useState("EFFECTIVE");
  const [similarContext, setSimilarContext] = useState("Y");
  const [comment, setComment] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [recommendation, setRecommendation] = useState("YES");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [submitMsg, setSubmitMsg] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addErr, setAddErr] = useState("");
  const [addMsg, setAddMsg] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    steps: "",
    overview: "",
    materials: "",
    season: "",
    location: "",
    cropTypeId: "",
    problemTypeId: "",
  });

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cropsRes, probsRes, seasonsRes] = await Promise.all([
          api.get("/meta/crops"),
          api.get("/meta/problems"),
          api.get("/meta/seasons"),
        ]);
        setCropOptions(cropsRes.data?.crops || []);
        setProblemOptions(probsRes.data?.problems || []);
        setSeasonOptions(seasonsRes.data?.seasons || []);
      } catch (e) {
        console.log("Failed to load dropdown options:", e);
      }
    }

    loadMeta();
  }, []);

  useEffect(() => {
    const id = searchParams.get("submitOutcomeFor");
    if (id) setOpenPracticeId(Number(id));
  }, [searchParams]);

  useEffect(() => {
    if (!openPracticeId) return;
    setOutcomeType("EFFECTIVE");
    setSimilarContext("Y");
    setComment("");
    setDurationDays("");
    setRecommendation("YES");
    setSubmitErr("");
    setSubmitMsg("");
  }, [openPracticeId]);

  async function fetchPractices(nextFilters = filters) {
    try {
      setLoading(true);
      setError("");
      const params = { sort: "validated", page: 1, limit: 50 };
      if (nextFilters.q.trim()) params.q = nextFilters.q.trim();
      if (nextFilters.cropTypeId) params.cropTypeId = nextFilters.cropTypeId;
      if (nextFilters.problemTypeId) params.problemTypeId = nextFilters.problemTypeId;
      if (nextFilters.season) params.season = nextFilters.season;
      const res = await api.get("/discover/practices", { params });
      setPractices(res.data?.results || []);
      setMeta(res.data?.meta || { total: 0 });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load practices.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPractices(filters);
    }, 180);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  function updateFilter(name, value) {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  function closeOutcomeModal() {
    setOpenPracticeId(null);
    const next = new URLSearchParams(searchParams);
    next.delete("submitOutcomeFor");
    next.delete("from");
    setSearchParams(next, { replace: true });
  }

  async function submitOutcome(e) {
    e.preventDefault();
    setSubmitErr("");
    setSubmitMsg("");

    if (!comment.trim()) {
      setSubmitErr("Please enter a short outcome comment.");
      return;
    }

    if (!durationDays || Number(durationDays) <= 0) {
      setSubmitErr("Please enter a valid number of days.");
      return;
    }

    try {
      setSubmitLoading(true);
      await api.post(`/practices/${openPracticeId}/outcomes`, {
        outcomeType,
        similarContext,
        comment: comment.trim(),
        durationDays: Number(durationDays),
        recommendation,
      });
      setSubmitMsg("Outcome submitted successfully.");

      const from = searchParams.get("from");
      if (from === "bookmarks") {
        setTimeout(() => {
          closeOutcomeModal();
          navigate("/app/bookmarks", { replace: true });
        }, 600);
        return;
      }

      await fetchPractices(filters);
      setTimeout(() => closeOutcomeModal(), 750);
    } catch (err) {
      setSubmitErr(err?.response?.data?.message || "Failed to submit outcome.");
    } finally {
      setSubmitLoading(false);
    }
  }

  function openAddModal() {
    setAddOpen(true);
    setAddLoading(false);
    setAddErr("");
    setAddMsg("");
    setImageFile(null);
    setForm({
      title: "",
      description: "",
      steps: "",
      overview: "",
      materials: "",
      season: "",
      location: "",
      cropTypeId: "",
      problemTypeId: "",
    });
  }

  function closeAddModal() {
    setAddOpen(false);
  }

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function submitPractice(e) {
    e.preventDefault();
    setAddErr("");
    setAddMsg("");

    if (!form.title.trim() || !form.description.trim() || !form.steps.trim()) {
      setAddErr("Title, description and steps are required.");
      return;
    }

    try {
      setAddLoading(true);
      const fd = new FormData();
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      fd.append("steps", form.steps.trim());
      fd.append("overview", form.overview.trim());
      fd.append("materials", form.materials.trim());
      fd.append("season", form.season || "");
      fd.append("location", form.location.trim());
      fd.append("cropTypeId", form.cropTypeId || "");
      fd.append("problemTypeId", form.problemTypeId || "");
      if (imageFile) fd.append("image", imageFile);

      await api.post("/practices", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAddMsg("Practice added successfully.");
      await fetchPractices(filters);
      setTimeout(() => closeAddModal(), 450);
    } catch (err) {
      setAddErr(err?.response?.data?.message || "Failed to add practice.");
    } finally {
      setAddLoading(false);
    }
  }

  if (loading) return <PracticesGridSkeleton count={6} />;

  if (error) {
    return (
      <div className="space-y-4 px-3 py-4 sm:px-4 md:px-6">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Practices</h1>
        </div>
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-slate-700 shadow-sm dark:border-red-900/30 dark:bg-white/5 dark:text-slate-200">
          Error getting practices. Check your internet connection and try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-3 py-4 text-slate-900 dark:text-slate-100 sm:px-4 md:px-6">
      <section className="max-w-4xl">
        <h1 className="font-heading text-3xl font-semibold sm:text-4xl">Practices</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300/75">
          Browse community practices with a clearer focus on what they are, where they apply, and how credible they look at a glance.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 lg:flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.q}
              onChange={(e) => updateFilter("q", e.target.value)}
              placeholder="Search practices"
              className={`${fieldClassName()} mt-0 pl-10`}
            />
          </div>

          <select
            value={filters.cropTypeId}
            onChange={(e) => updateFilter("cropTypeId", e.target.value)}
            className={`${fieldClassName()} mt-0 lg:w-[170px]`}
          >
            <option value="">All crops</option>
            {cropOptions.map((crop) => (
              <option key={crop.cropTypeId} value={crop.cropTypeId}>
                {crop.name}
              </option>
            ))}
          </select>

          <select
            value={filters.problemTypeId}
            onChange={(e) => updateFilter("problemTypeId", e.target.value)}
            className={`${fieldClassName()} mt-0 lg:w-[190px]`}
          >
            <option value="">All problems</option>
            {problemOptions.map((problem) => (
              <option key={problem.problemTypeId} value={problem.problemTypeId}>
                {problem.name}
              </option>
            ))}
          </select>

          <select
            value={filters.season}
            onChange={(e) => updateFilter("season", e.target.value)}
            className={`${fieldClassName()} mt-0 lg:w-[160px]`}
          >
            <option value="">All seasons</option>
            {seasonOptions.map((season) => (
              <option key={String(season)} value={season.name || season}>
                {season.name || season}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add Practice
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-sm text-slate-500 dark:text-slate-300/65">
          {practices.length}
          {meta.total ? ` of ${meta.total}` : ""} practices
        </p>

        {practices.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="font-heading text-2xl font-semibold text-slate-900 dark:text-white">No practices found</h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300/75">
              Try a different search or reset the filters by selecting the default options again.
            </p>
          </div>
        ) : (
          practices.map((practice) => (
            <PracticeRow
              key={practice.practiceId}
              practice={practice}
              onOpenDetails={(practiceId) => navigate(`/app/practices/${practiceId}`)}
            />
          ))
        )}
      </section>

      {openPracticeId ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-2 sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={closeOutcomeModal} />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1220]">
            <div className="border-b border-slate-200 p-5 dark:border-white/10 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700/75 dark:text-emerald-200/70">
                Outcome Report
              </p>
              <h2 className="mt-2 font-heading text-2xl font-semibold text-slate-900 dark:text-white">
                Submit field validation feedback
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/75">
                Share what happened after applying this practice so the catalog becomes more trustworthy for everyone.
              </p>
            </div>

            <form onSubmit={submitOutcome} className="space-y-4 p-5 sm:p-6">
              {submitErr ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                  {submitErr}
                </div>
              ) : null}

              {submitMsg ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                  {submitMsg}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300/60">
                    Outcome
                  </label>
                  <select value={outcomeType} onChange={(e) => setOutcomeType(e.target.value)} className={fieldClassName()}>
                    <option value="EFFECTIVE">Effective</option>
                    <option value="PARTIAL">Partially effective</option>
                    <option value="INEFFECTIVE">Ineffective</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300/60">
                    Similar context
                  </label>
                  <select value={similarContext} onChange={(e) => setSimilarContext(e.target.value)} className={fieldClassName()}>
                    <option value="Y">Yes</option>
                    <option value="N">No</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300/60">
                    Duration in days
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className={fieldClassName()}
                    placeholder="e.g. 14"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300/60">
                    Recommend to others
                  </label>
                  <select value={recommendation} onChange={(e) => setRecommendation(e.target.value)} className={fieldClassName()}>
                    <option value="YES">Yes</option>
                    <option value="NO">No</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300/60">
                  Outcome comment
                </label>
                <textarea
                  rows={5}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className={`${fieldClassName()} resize-none`}
                  placeholder="Describe the field conditions, what changed, and any visible results."
                />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeOutcomeModal}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {submitLoading ? "Submitting..." : "Submit outcome"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {addOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-2 sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={closeAddModal} />
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1220]">
            <div className="border-b border-slate-200 p-5 dark:border-white/10 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700/75 dark:text-emerald-200/70">
                New Practice
              </p>
              <h2 className="mt-2 font-heading text-2xl font-semibold text-slate-900 dark:text-white">
                Add a new knowledge record
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/75">
                Capture the method clearly so other farmers can evaluate, discuss, and validate it later.
              </p>
            </div>

            <form onSubmit={submitPractice} className="max-h-[78vh] space-y-4 overflow-y-auto p-5 sm:p-6">
              {addErr ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                  {addErr}
                </div>
              ) : null}

              {addMsg ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                  {addMsg}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300/60">
                    Title
                  </label>
                  <input value={form.title} onChange={(e) => setField("title", e.target.value)} className={fieldClassName()} placeholder="Name of the practice" />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300/60">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    className={`${fieldClassName()} resize-none`}
                    placeholder="Short explanation of the practice."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300/60">
                    Overview
                  </label>
                  <textarea
                    rows={4}
                    value={form.overview}
                    onChange={(e) => setField("overview", e.target.value)}
                    className={`${fieldClassName()} resize-none`}
                    placeholder="Why it works and when to use it."
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300/60">
                    Crop
                  </label>
                  <select value={form.cropTypeId} onChange={(e) => setField("cropTypeId", e.target.value)} className={fieldClassName()}>
                    <option value="">Select crop</option>
                    {cropOptions.map((crop) => (
                      <option key={crop.cropTypeId} value={crop.cropTypeId}>
                        {crop.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300/60">
                    Problem type
                  </label>
                  <select value={form.problemTypeId} onChange={(e) => setField("problemTypeId", e.target.value)} className={fieldClassName()}>
                    <option value="">Select problem</option>
                    {problemOptions.map((problem) => (
                      <option key={problem.problemTypeId} value={problem.problemTypeId}>
                        {problem.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300/60">
                    Season
                  </label>
                  <select value={form.season} onChange={(e) => setField("season", e.target.value)} className={fieldClassName()}>
                    <option value="">Select season</option>
                    {seasonOptions.map((season) => (
                      <option key={String(season)} value={season.name || season}>
                        {season.name || season}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300/60">
                    Location
                  </label>
                  <input value={form.location} onChange={(e) => setField("location", e.target.value)} className={fieldClassName()} placeholder="e.g. Buea" />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300/60">
                    Materials
                  </label>
                  <textarea
                    rows={4}
                    value={form.materials}
                    onChange={(e) => setField("materials", e.target.value)}
                    className={`${fieldClassName()} resize-none`}
                    placeholder="List materials, one per line."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300/60">
                    Steps
                  </label>
                  <textarea
                    rows={6}
                    value={form.steps}
                    onChange={(e) => setField("steps", e.target.value)}
                    className={`${fieldClassName()} resize-none`}
                    placeholder="Describe the steps, one per line or numbered."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300/60">
                    Thumbnail image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className={`${fieldClassName()} file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-emerald-800 dark:file:bg-emerald-500/15 dark:file:text-emerald-200`}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
                >
                  <Plus className="h-4 w-4" />
                  {addLoading ? "Saving..." : "Create practice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

