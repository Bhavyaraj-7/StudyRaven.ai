"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, ExternalLink, Trash2, Upload, TimerReset, Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import type { UserPaper } from "@/types";

export default function LibraryTab({ mode }: { mode: "papers" | "marks" }) {
  const router = useRouter();
  const [items, setItems] = useState<UserPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const sb = supabaseBrowser();
    const { data } = await sb
      .from("user_papers")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Stored values are either full http links (pasted) or storage paths
  // inside the private "papers" bucket (uploaded) — those need a signed URL.
  async function open(value: string) {
    if (value.startsWith("http")) {
      window.open(value, "_blank", "noopener,noreferrer");
      return;
    }
    const sb = supabaseBrowser();
    const { data, error } = await sb.storage
      .from("papers")
      .createSignedUrl(value, 3600);
    if (error || !data?.signedUrl) {
      alert("Couldn't open this file. Try re-uploading it.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function remove(p: UserPaper) {
    const sb = supabaseBrowser();
    // Clean up uploaded files from storage too (pasted URLs are skipped).
    const paths = [p.pdf_url, p.mark_scheme_url].filter(
      (v): v is string => !!v && !v.startsWith("http"),
    );
    if (paths.length) await sb.storage.from("papers").remove(paths);
    await sb.from("user_papers").delete().eq("id", p.id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-graytext">Your uploaded {mode === "papers" ? "papers" : "mark schemes"}.</p>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink text-paper px-3 py-1.5 text-sm"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {showForm && <UploadForm onDone={() => { setShowForm(false); load(); }} />}

      {loading ? (
        <div className="text-graymute text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-grayline p-10 text-center text-graymute">
          No uploads yet. Click Add to upload your first paper.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((p) => {
            const value = mode === "papers" ? p.pdf_url : p.mark_scheme_url;
            if (!value) return null;
            return (
              <div key={p.id} className="rounded-xl border border-grayline p-4 flex items-start justify-between">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-graytext" />
                    {p.subject} {p.year ? `· ${p.year}` : ""}{p.paper_number ? ` · ${p.paper_number}` : ""}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => open(value)}
                      className="text-sm text-graytext underline inline-flex items-center gap-1"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/mocks?subject=${encodeURIComponent(p.subject)}`)
                      }
                      className="text-sm font-medium underline inline-flex items-center gap-1"
                    >
                      <TimerReset className="w-3.5 h-3.5" /> Take as mock
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => remove(p)}
                  className="text-graymute hover:text-ink"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function UploadForm({ onDone }: { onDone: () => void }) {
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [paperNumber, setPaperNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msFile, setMsFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [msUrl, setMsUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadToStorage(uid: string, f: File): Promise<string> {
    const sb = supabaseBrowser();
    const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${uid}/${Date.now()}_${safeName}`;
    const { error: err } = await sb.storage.from("papers").upload(path, f);
    if (err) throw new Error(err.message);
    return path;
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const sb = supabaseBrowser();
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) throw new Error("Not logged in.");

      let paperValue = pdfUrl.trim();
      let msValue = msUrl.trim();
      if (file) paperValue = await uploadToStorage(auth.user.id, file);
      if (msFile) msValue = await uploadToStorage(auth.user.id, msFile);
      if (!paperValue) throw new Error("Upload a file or paste a link first.");

      const { error: err } = await sb.from("user_papers").insert({
        user_id: auth.user.id,
        subject,
        year: year ? Number(year) : null,
        paper_number: paperNumber || null,
        pdf_url: paperValue,
        mark_scheme_url: msValue || null,
      });
      if (err) throw new Error(err.message);
      onDone();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-grayline p-4 mb-4 space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="rounded-lg border border-grayline px-3 py-2 outline-none focus:border-ink"
        />
        <input
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded-lg border border-grayline px-3 py-2 outline-none focus:border-ink"
        />
        <input
          placeholder="Paper #"
          value={paperNumber}
          onChange={(e) => setPaperNumber(e.target.value)}
          className="rounded-lg border border-grayline px-3 py-2 outline-none focus:border-ink"
        />
      </div>

      <label className="block">
        <span className="text-xs text-graymute">Paper PDF</span>
        <div className="mt-1 rounded-lg border border-dashed border-grayline px-4 py-3 flex items-center gap-2 cursor-pointer hover:border-ink">
          <Upload className="w-4 h-4 text-graytext" />
          <span className="text-sm text-graytext">{file?.name ?? "Choose file"}</span>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </label>
      <label className="block">
        <span className="text-xs text-graymute">Mark scheme PDF (optional)</span>
        <div className="mt-1 rounded-lg border border-dashed border-grayline px-4 py-3 flex items-center gap-2 cursor-pointer hover:border-ink">
          <Upload className="w-4 h-4 text-graytext" />
          <span className="text-sm text-graytext">{msFile?.name ?? "Choose file"}</span>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setMsFile(e.target.files?.[0] ?? null)}
          />
        </div>
      </label>

      <details>
        <summary className="text-xs text-graymute cursor-pointer">
          Or paste links instead (Google Drive / Dropbox)
        </summary>
        <div className="mt-2 space-y-2">
          <input
            placeholder="PDF URL"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            className="w-full rounded-lg border border-grayline px-3 py-2 outline-none focus:border-ink"
          />
          <input
            placeholder="Mark scheme URL (optional)"
            value={msUrl}
            onChange={(e) => setMsUrl(e.target.value)}
            className="w-full rounded-lg border border-grayline px-3 py-2 outline-none focus:border-ink"
          />
        </div>
      </details>

      {error && (
        <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg p-3">
          {error}
        </div>
      )}
      <button
        onClick={save}
        disabled={saving || !subject || (!file && !pdfUrl)}
        className="rounded-lg bg-ink text-paper px-4 py-2 text-sm disabled:opacity-50 inline-flex items-center gap-2"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saving ? "Uploading..." : "Save"}
      </button>
    </div>
  );
}
