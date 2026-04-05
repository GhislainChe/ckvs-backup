import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/api";
import { useNavigate } from "react-router-dom";
import defaultPracticeImg from "../../assets/practice-default.jpg";
import { buildImageUrl } from "../../utils/media";
import {
  Bookmark,
  MessageCircle,
  Leaf,
  ShieldCheck,
  Pencil,
  X,
  Mail,
  User as UserIcon,
} from "lucide-react";
import ProfileSkeleton from "../../components/UIskeletons/ProfileSkeleton";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function scoreLabel(score) {
  if (score >= 80) return { label: "Very trusted", tone: "emerald" };
  if (score >= 60) return { label: "Trusted", tone: "emerald" };
  if (score >= 40) return { label: "Growing", tone: "amber" };
  return { label: "New", tone: "slate" };
}

function credibilityTone(tone) {
  if (tone === "emerald") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200";
  if (tone === "amber") return "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200";
  return "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200";
}

export default function ProfilePage() {
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [created, setCreated] = useState([]);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [discussionsCount, setDiscussionsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editErr, setEditErr] = useState("");
  const [editMsg, setEditMsg] = useState("");
  const [editForm, setEditForm] = useState({ fullName: "", email: "" });

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const meRes = await api.get("/users/me");
      const user = meRes.data?.user || null;
      setMe(user);

      const mineRes = await api.get("/practices/mine");
      setCreated(mineRes.data?.practices || []);

      const appliedRes = await api.get("/practices/applied");
      const appliedList = Array.isArray(appliedRes.data)
        ? appliedRes.data
        : appliedRes.data?.applied || appliedRes.data?.practices || [];
      setBookmarksCount(appliedList.length);

      try {
        const discussionsRes = await api.get("/discussions/mine");
        const discussionList =
          discussionsRes.data?.discussions || discussionsRes.data?.results || [];
        setDiscussionsCount(Array.isArray(discussionList) ? discussionList.length : 0);
      } catch {
        setDiscussionsCount(0);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const credibility = useMemo(() => {
    const raw = Number(me?.credibilityScore ?? 0);
    const percent = raw <= 1 ? raw * 100 : raw;
    return clamp(percent, 0, 100);
  }, [me]);

  const cred = useMemo(() => scoreLabel(credibility), [credibility]);
  const fullName = me?.fullName || "User";
  const email = me?.email || "";
  const role = me?.userRole || "USER";

  const recentActivity = useMemo(() => {
    const items = [];

    if (created.length > 0) {
      items.push({
        title: `${created.length} practice${created.length === 1 ? "" : "s"} created`,
        detail: "Your created practices are the strongest signal of contribution and community value.",
      });
    }

    if (discussionsCount > 0) {
      items.push({
        title: `${discussionsCount} discussion contribution${discussionsCount === 1 ? "" : "s"}`,
        detail: "Discussion participation helps shared practices gain context and practical interpretation.",
      });
    }

    if (bookmarksCount > 0) {
      items.push({
        title: `${bookmarksCount} bookmarked practice${bookmarksCount === 1 ? "" : "s"}`,
        detail: "Saved practices show where you are actively following community knowledge.",
      });
    }

    if (!items.length) {
      items.push({
        title: "No recent contribution yet",
        detail: "Create a practice or join a discussion to begin building your contributor record.",
      });
    }

    return items.slice(0, 3);
  }, [bookmarksCount, created.length, discussionsCount]);

  function openEdit() {
    setEditErr("");
    setEditMsg("");
    setEditLoading(false);
    setEditForm({
      fullName: me?.fullName || "",
      email: me?.email || "",
    });
    setEditOpen(true);
  }

  function closeEdit() {
    if (editLoading) return;
    setEditOpen(false);
  }

  async function submitEdit(e) {
    e.preventDefault();
    setEditErr("");
    setEditMsg("");

    if (!editForm.fullName.trim()) {
      setEditErr("Full name is required.");
      return;
    }
    if (!editForm.email.trim()) {
      setEditErr("Email is required.");
      return;
    }

    try {
      setEditLoading(true);
      const res = await api.patch("/users/me", {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
      });

      setMe(res.data?.user || null);
      setEditMsg("Profile updated successfully.");
      setTimeout(() => {
        setEditOpen(false);
      }, 600);
    } catch (err) {
      setEditErr(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setEditLoading(false);
    }
  }

  if (loading) return <ProfileSkeleton />;

  if (error) {
    return (
      <div className="space-y-4 px-3 py-4 sm:px-4 md:px-6">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Profile</h1>
        </div>

        <div className="rounded-2xl border border-red-200 bg-white p-6 text-slate-700 shadow-sm dark:border-red-900/30 dark:bg-white/5 dark:text-slate-200">
          Error getting your profile. Check your internet connection and try again.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-3 py-4 text-slate-900 dark:text-slate-100 sm:px-4 md:px-6">
      <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4 sm:gap-5">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-[28px] bg-emerald-600 text-3xl font-semibold text-white shadow-lg shadow-emerald-700/20">
              {fullName?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate font-heading text-3xl font-semibold sm:text-4xl">{fullName}</h1>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-200">
                  {role}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${credibilityTone(cred.tone)}`}>
                  {cred.label}
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300/75">
                Contributor profile for sharing practices, participating in validation, and building trust through useful field knowledge.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-300/65">
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {email}
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Credibility {credibility.toFixed(0)}/100
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={openEdit}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <Pencil className="h-4 w-4" />
              Edit profile
            </button>
            <button
              onClick={() => navigate("/app/practices")}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Leaf className="h-4 w-4" />
              Open practices
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-heading text-2xl font-semibold">Created practices</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/75">
                  The main record of what you have contributed to the community knowledge base.
                </p>
              </div>

              <button
                onClick={loadProfile}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                Refresh
              </button>
            </div>

            {created.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-white/15 dark:bg-white/5">
                <p className="font-heading text-xl font-semibold">No practices created yet</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/75">
                  Start contributing to build your credibility and create a stronger contributor profile.
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-4">
                {created.map((practice) => {
                  const imgSrc = buildImageUrl(practice.imageUrl) || defaultPracticeImg;
                  const createdAt = practice.createdAt
                    ? new Date(practice.createdAt).toLocaleDateString()
                    : "";

                  return (
                    <button
                      key={practice.practiceId}
                      type="button"
                      onClick={() => navigate(`/app/practices/${practice.practiceId}`)}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:shadow-md dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex gap-4">
                        <img
                          src={imgSrc}
                          alt={practice.title}
                          className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-heading text-xl font-semibold">{practice.title}</p>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-700 dark:bg-white/10 dark:text-slate-200">
                              {practice.status || "ACTIVE"}
                            </span>
                          </div>

                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300/75">
                            {practice.description}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-300/60">
                            {createdAt ? <span>{createdAt}</span> : null}
                            <span>{practice.confidenceLevel || "LOW"} confidence</span>
                            <span>Score {practice.effectivenessScore ?? "-"}</span>
                            {practice.location ? <span>{practice.location}</span> : null}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
            <h2 className="font-heading text-2xl font-semibold">Recent participation</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/75">
              A compact view of how you are contributing beyond profile details.
            </p>

            <div className="mt-5 grid gap-3">
              {recentActivity.map((item) => (
                <div key={item.title} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                  <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300/75">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="space-y-5">
            <section className="rounded-[30px] border border-emerald-900/10 bg-[linear-gradient(180deg,rgba(218,245,231,0.92),rgba(247,248,242,0.98))] p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(10,33,26,0.94),rgba(11,18,32,0.98))] sm:p-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-200" />
                <p className="font-medium">Credibility</p>
              </div>
              <h2 className="mt-4 font-heading text-4xl font-semibold">{credibility.toFixed(0)}/100</h2>
              <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">{cred.label}</p>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300/75">
                Your score grows when shared practices receive stronger validation and remain useful in real field conditions.
              </p>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/70 dark:bg-white/10">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: `${credibility}%` }} />
              </div>
            </section>

            <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <h3 className="font-heading text-xl font-semibold">Stats</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <button
                  onClick={() => navigate("/app/practices")}
                  className="rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <p className="text-2xl font-semibold">{created.length}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300/75">Created practices</p>
                </button>
                <button
                  onClick={() => navigate("/app/discussions")}
                  className="rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <p className="text-2xl font-semibold">{discussionsCount}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300/75">Discussion activity</p>
                </button>
                <button
                  onClick={() => navigate("/app/bookmarks")}
                  className="rounded-2xl bg-slate-50 p-4 text-left transition hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <p className="text-2xl font-semibold">{bookmarksCount}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300/75">Bookmarks</p>
                </button>
              </div>
            </section>

            <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <h3 className="font-heading text-xl font-semibold">Quick actions</h3>
              <div className="mt-4 grid gap-2">
                <button
                  onClick={openEdit}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <Pencil className="h-4 w-4" />
                  Edit profile
                </button>
                <button
                  onClick={() => navigate("/app/practices")}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  <Leaf className="h-4 w-4" />
                  Explore practices
                </button>
                <button
                  onClick={() => navigate("/app/discussions")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <MessageCircle className="h-4 w-4" />
                  Open discussions
                </button>
              </div>
            </section>
          </div>
        </aside>
      </section>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-2 sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeEdit}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#0b1220]">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4 dark:border-white/10">
              <div>
                <h2 className="font-heading text-xl font-semibold">Edit profile</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300/70">
                  Update your identity details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-4">
              {editErr && (
                <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                  {editErr}
                </div>
              )}
              {editMsg && (
                <div className="mb-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                  {editMsg}
                </div>
              )}

              <form onSubmit={submitEdit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300/70">
                    Full name
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
                    <UserIcon className="h-4 w-4 text-slate-500 dark:text-slate-300/70" />
                    <input
                      value={editForm.fullName}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300/70">
                    Email
                  </label>
                  <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
                    <Mail className="h-4 w-4 text-slate-500 dark:text-slate-300/70" />
                    <input
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="w-full bg-transparent text-sm outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeEdit}
                    disabled={editLoading}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
                  >
                    {editLoading ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
