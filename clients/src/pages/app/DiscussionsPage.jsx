import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Flag,
  Shield,
  MessageSquareText,
  Send,
} from "lucide-react";
import { api } from "../../api/api";
import DiscoverListSkeleton from "../../components/UIskeletons/ProfileSkeleton";
import ReportModal from "../../components/ReportModal";

function formatDateTime(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value || "";
  }
}

export default function DiscussionsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const practiceId = searchParams.get("practiceId");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const [practiceInfo, setPracticeInfo] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [errorThread, setErrorThread] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const [threads, setThreads] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState("");

  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState({ type: "COMMENT", id: 0 });
  const [reportSubtitle, setReportSubtitle] = useState("");

  const bottomRef = useRef(null);

  const isSystemThread = String(practiceId || "").toLowerCase() === "system";
  const isPracticeThread = !!practiceId && !isSystemThread;

  function flattenCommentsTree(nodes) {
    const out = [];
    const walk = (arr) => {
      for (const node of arr || []) {
        out.push(node);
        if (node.replies && node.replies.length) walk(node.replies);
      }
    };
    walk(nodes);
    return out;
  }

  const commentMap = useMemo(() => {
    const map = new Map();
    for (const comment of comments) map.set(String(comment.commentId), comment);
    return map;
  }, [comments]);

  async function loadNotifications() {
    try {
      setLoadingNotifications(true);
      const res = await api.get("/notifications/mine");
      setNotifications(res.data?.notifications || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }

  useEffect(() => {
    async function loadThread() {
      if (!isPracticeThread) return;

      try {
        setLoadingThread(true);
        setErrorThread("");

        const practiceRes = await api.get(`/practices/${practiceId}`);
        const practice = practiceRes.data?.practice
          ? practiceRes.data.practice
          : practiceRes.data;

        setPracticeInfo({
          title: practice?.title || "Practice discussion",
          authorName: practice?.author?.fullName || "Community member",
        });

        const res = await api.get(`/practices/${practiceId}/comments`);
        const roots = res?.data?.comments || [];
        setComments(flattenCommentsTree(roots));
      } catch (err) {
        setErrorThread(err?.response?.data?.message || "Failed to load discussion");
      } finally {
        setLoadingThread(false);
      }
    }

    loadThread();
  }, [practiceId, isPracticeThread]);

  useEffect(() => {
    if (!isSystemThread) return;
    loadNotifications();
  }, [isSystemThread]);

  useEffect(() => {
    async function loadList() {
      if (practiceId) return;

      try {
        setLoadingList(true);
        setErrorList("");

        let threadsData = [];
        try {
          const res = await api.get("/discussions/mine");
          const raw = res.data;
          threadsData =
            (Array.isArray(raw) && raw) ||
            raw?.threads ||
            raw?.data ||
            raw?.results ||
            [];
        } catch {
          threadsData = [];
        }

        setThreads(Array.isArray(threadsData) ? threadsData : []);
        await loadNotifications();
      } catch (err) {
        setErrorList(
          err?.response?.data?.message ||
            "Error loading discussions and notifications.",
        );
      } finally {
        setLoadingList(false);
      }
    }

    loadList();
  }, [practiceId]);

  useEffect(() => {
    if (!isPracticeThread && !isSystemThread) return;
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [isPracticeThread, isSystemThread, comments.length, notifications.length]);

  async function reloadThread() {
    if (!isPracticeThread) return;
    const res = await api.get(`/practices/${practiceId}/comments`);
    const roots = res?.data?.comments || [];
    setComments(flattenCommentsTree(roots));
  }

  async function handleSend() {
    const trimmed = message.trim();
    if (!trimmed || sending || !isPracticeThread) return;

    try {
      setSending(true);
      await api.post(`/practices/${practiceId}/comments`, { content: trimmed });
      setMessage("");
      await reloadThread();
    } catch (err) {
      setErrorThread(err?.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  async function handleReplySend() {
    const trimmed = replyText.trim();
    if (!trimmed || sending || !replyTo || !isPracticeThread) return;

    try {
      setSending(true);
      await api.post(`/practices/${practiceId}/comments/${replyTo.commentId}/replies`, {
        content: trimmed,
      });
      setReplyText("");
      setReplyTo(null);
      await reloadThread();
    } catch (err) {
      setErrorThread(err?.response?.data?.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e) {
    if (!isPracticeThread) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (replyTo) handleReplySend();
      else handleSend();
    }
  }

  function openReportComment(comment) {
    setReportTarget({ type: "COMMENT", id: Number(comment.commentId) || 0 });
    setReportSubtitle(
      `Reporting a comment by ${comment.authorName || "User"} (ID: ${comment.commentId})`,
    );
    setReportOpen(true);
  }

  if (loadingList) return <DiscoverListSkeleton count={6} />;

  if (errorList) {
    return (
      <div className="space-y-4 px-3 py-4 sm:px-4 md:px-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700/75 dark:text-emerald-200/70">
            Conversation Workspace
          </p>
          <h1 className="font-heading text-3xl font-semibold">Discussions</h1>
        </div>

        <div className="rounded-[28px] border border-red-200 bg-white/80 p-6 text-slate-700 shadow-sm dark:border-red-900/30 dark:bg-white/5 dark:text-slate-200">
          Error getting your discussions. Check your internet connection and try again.
        </div>
      </div>
    );
  }

  if (!practiceId) {
    const systemCount = notifications.length;

    return (
      <div className="space-y-6 px-3 py-4 sm:px-4 md:px-6">
        <section className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700/75 dark:text-emerald-200/70">
            Conversation Workspace
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">
            Discussions
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300/75">
            Follow community conversations, reopen active practice threads, and
            track moderator notices in one cleaner workspace.
          </p>
        </section>

        <section className="grid gap-4">
          {systemCount > 0 && (
            <button
              type="button"
              onClick={() => navigate("/app/discussions?practiceId=system")}
              className="w-full rounded-[28px] border border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,255,255,0.95))] p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-amber-500/20 dark:bg-[linear-gradient(180deg,rgba(69,39,6,0.35),rgba(11,18,32,0.94))]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/15 text-amber-800 dark:text-amber-200">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-heading text-xl font-semibold">System notices</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300/75">
                        Moderator and admin decisions, updates, and alerts
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm text-slate-700 dark:text-slate-200">
                    {notifications[0]?.message || "Open to view notices"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-slate-300/60">
                    {notifications[0]?.createdAt
                      ? formatDateTime(notifications[0].createdAt)
                      : ""}
                  </p>
                  <span className="mt-3 inline-flex rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-500/20 dark:text-amber-200">
                    {systemCount} notices
                  </span>
                </div>
              </div>
            </button>
          )}

          {!loadingList && !threads.length && !systemCount && (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/60 p-10 text-center shadow-sm dark:border-white/15 dark:bg-white/5">
              <p className="font-heading text-2xl font-semibold">No discussion threads yet</p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300/75">
                Once you comment on practices, your active threads will appear here.
              </p>
            </div>
          )}

          {!!threads.length && (
            <div className="grid gap-4">
              {threads.map((thread) => (
                <button
                  key={thread.practiceId}
                  type="button"
                  onClick={() =>
                    navigate(`/app/discussions?practiceId=${thread.practiceId}`)
                  }
                  className="w-full rounded-[28px] border border-white/70 bg-white/80 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-heading text-xl font-semibold">
                        {thread.title || "Practice discussion"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-300/60">
                        by {thread.authorName || "Community member"}
                      </p>
                      <p className="mt-4 line-clamp-2 text-sm leading-7 text-slate-600 dark:text-slate-300/75">
                        {thread.lastMessage || "No message yet"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-300/60">
                        {thread.lastAt ? formatDateTime(thread.lastAt) : ""}
                      </p>
                      <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
                        {thread.messagesCount || 0} messages
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  if (isSystemThread) {
    return (
      <div className="space-y-5 px-3 py-4 sm:px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/app/discussions")}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700/80 dark:text-amber-200/70">
              System notices
            </p>
            <h1 className="font-heading text-3xl font-semibold">Moderator messages</h1>
          </div>
        </div>

        <div className="space-y-4 rounded-[32px] border border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,255,255,0.96))] p-5 shadow-sm dark:border-amber-500/20 dark:bg-[linear-gradient(180deg,rgba(69,39,6,0.35),rgba(11,18,32,0.96))]">
          {loadingNotifications && <p className="text-sm text-slate-500">Loading system messages...</p>}

          {!loadingNotifications && notifications.length === 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-300/75">No system messages yet.</p>
          )}

          {notifications.map((notification) => (
            <article
              key={notification.notificationId}
              className="rounded-[24px] border border-amber-200 bg-white/90 p-4 shadow-sm dark:border-amber-500/20 dark:bg-white/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700/75 dark:text-amber-200/75">
                    System
                  </p>
                  <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                    {notification.title}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">
                    {notification.message}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xs text-slate-500 dark:text-slate-300/60">
                    {formatDateTime(notification.createdAt)}
                  </p>
                  {notification.linkUrl ? (
                    <button
                      type="button"
                      onClick={() => navigate(notification.linkUrl)}
                      className="mt-3 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-amber-500 dark:text-slate-950"
                    >
                      Open
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}

          <div ref={bottomRef} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 px-3 py-4 sm:px-4 md:px-6">
      <section className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/app/discussions")}
          className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700/75 dark:text-emerald-200/70">
            Practice discussion
          </p>
          <h1 className="truncate font-heading text-3xl font-semibold">
            {practiceInfo?.title || "Practice discussion"}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300/75">
            Practice by {practiceInfo?.authorName || "Community member"}
          </p>
        </div>
      </section>

      {loadingThread && <p className="text-sm text-slate-500">Loading messages...</p>}
      {errorThread && <p className="text-sm text-red-600">{errorThread}</p>}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-h-[60vh] rounded-[32px] border border-white/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300/60">
                Thread
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300/75">
                Community replies in chronological order
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
              {comments.length} messages
            </span>
          </div>

          <div className="space-y-4">
            {!loadingThread && !errorThread && comments.length === 0 && (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center dark:border-white/15 dark:bg-white/5">
                <p className="font-heading text-xl font-semibold">No messages yet</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300/75">
                  Be the first person to start the conversation.
                </p>
              </div>
            )}

            {comments.map((comment) => {
              const isMine = Number(comment.userId) === Number(user?.userId);
              const isSystem =
                comment.isModerationNotice || String(comment.authorName) === "System";
              const parent = comment.parentCommentId
                ? commentMap.get(String(comment.parentCommentId))
                : null;
              const parentName =
                parent?.authorName ||
                (Number(parent?.userId) === Number(user?.userId) ? "You" : "User");

              return (
                <div
                  key={comment.commentId}
                  className={`flex ${isSystem ? "justify-center" : isMine ? "justify-end" : "justify-start"}`}
                >
                  <article
                    className={`max-w-[92%] rounded-[24px] px-4 py-3 shadow-sm sm:max-w-[82%] ${
                      isSystem
                        ? "border border-amber-200 bg-amber-50 text-slate-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-slate-100"
                        : isMine
                          ? "bg-emerald-600 text-white"
                          : "border border-slate-200 bg-slate-50 text-slate-900 dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
                    }`}
                  >
                    {!isMine && !isSystem && (
                      <p className="text-xs font-semibold opacity-80">
                        {comment.authorName || "User"}
                      </p>
                    )}

                    {isSystem && (
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-200">
                        Moderator notice
                      </p>
                    )}

                    {!isSystem && comment.parentCommentId ? (
                      <div
                        className={`mt-2 rounded-2xl px-3 py-2 text-xs ${
                          isMine
                            ? "bg-white/15 text-white/90"
                            : "bg-black/5 text-slate-700 dark:bg-white/10 dark:text-slate-200"
                        }`}
                      >
                        <p className="font-semibold">Replying to {parentName}</p>
                        <p className="mt-1 line-clamp-2">{parent?.content || "Original message"}</p>
                      </div>
                    ) : null}

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{comment.content}</p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-[11px] opacity-70">
                        {formatDateTime(comment.createdAt)}
                      </p>

                      {!isSystem && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openReportComment(comment)}
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                              isMine
                                ? "bg-white/15 text-white hover:bg-white/20"
                                : "bg-black/10 text-slate-700 hover:bg-black/15 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
                            }`}
                          >
                            <span className="inline-flex items-center gap-1">
                              <Flag className="h-3.5 w-3.5" />
                              Report
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyTo({
                                commentId: comment.commentId,
                                userId: comment.userId,
                                authorName: comment.authorName || "User",
                                content: comment.content,
                              });
                              setReplyText("");
                            }}
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                              isMine
                                ? "bg-white/15 text-white hover:bg-white/20"
                                : "bg-black/10 text-slate-700 hover:bg-black/15 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
                            }`}
                          >
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4 rounded-[32px] border border-emerald-900/10 bg-[linear-gradient(180deg,rgba(218,245,231,0.95),rgba(247,248,242,0.98))] p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(10,33,26,0.94),rgba(11,18,32,0.98))]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700/75 dark:text-emerald-200/70">
                Reply panel
              </p>
              <h2 className="mt-2 font-heading text-2xl font-semibold">
                Keep the conversation moving
              </h2>
            </div>

            {replyTo && (
              <div className="rounded-[24px] border border-emerald-200 bg-white/80 p-4 shadow-sm dark:border-emerald-500/20 dark:bg-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-200">
                      Replying to {replyTo.authorName}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300/75">
                      {replyTo.content}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyText("");
                    }}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold dark:border-white/10 dark:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-[24px] border border-white/70 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300/60">
                Message
              </label>
              <textarea
                value={replyTo ? replyText : message}
                onChange={(e) =>
                  replyTo ? setReplyText(e.target.value) : setMessage(e.target.value)
                }
                onKeyDown={onKeyDown}
                rows={8}
                placeholder={replyTo ? "Write a reply..." : "Write a message..."}
                className="mt-3 w-full resize-none rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/5"
              />

              <button
                type="button"
                disabled={sending}
                onClick={() => (replyTo ? handleReplySend() : handleSend())}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : replyTo ? "Send reply" : "Send message"}
              </button>
            </div>

            <div className="rounded-[24px] border border-white/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300/60">
                Workspace notes
              </p>
              <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300/75">
                <li className="flex gap-3">
                  <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-200" />
                  Keep comments specific to the field context and observed outcomes.
                </li>
                <li className="flex gap-3">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-200" />
                  Moderator notices appear with a distinct system style in the thread.
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </section>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType={reportTarget.type}
        targetId={reportTarget.id}
        title="Report comment"
        subtitle={reportSubtitle}
      />
    </div>
  );
}
