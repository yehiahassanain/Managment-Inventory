"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface ProductImageUploaderProps {
  initialImageUrl?: string | null;
}

type UploadState = "idle" | "dragging" | "uploading" | "done" | "error";

export default function ProductImageUploader({
  initialImageUrl,
}: ProductImageUploaderProps) {
  // Track when the parent re-opens the form with a different product
  const [prevInitial, setPrevInitial] = useState(initialImageUrl);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(
    initialImageUrl || null
  );
  const [uploadState, setUploadState] = useState<UploadState>(
    initialImageUrl ? "done" : "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0); // counts nested dragenter/dragleave events

  // Sync when parent passes a different initialImageUrl (e.g. switching edited product)
  if (initialImageUrl !== prevInitial) {
    setPrevInitial(initialImageUrl);
    setUploadedUrl(initialImageUrl || null);
    setUploadState(initialImageUrl ? "done" : "idle");
    setErrorMsg(null);
  }

  // Fake a smooth progress bar while uploading (real XHR progress not available with fetch)
  useEffect(() => {
    if (uploadState !== "uploading") {
      setUploadProgress(0);
      return;
    }
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev < 85 ? prev + 8 : prev));
    }, 180);
    return () => clearInterval(interval);
  }, [uploadState]);

  // ── Core upload logic ──────────────────────────────────────────────────────

  const uploadFile = useCallback(async (file: File) => {
    setUploadState("uploading");
    setErrorMsg(null);
    setUploadedUrl(null);

    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed. Please try again.");
      }

      setUploadProgress(100);
      // Brief pause so the bar reaches 100% visually before switching to preview
      setTimeout(() => {
        setUploadedUrl(data.url as string);
        setUploadState("done");
      }, 300);
    } catch (err: unknown) {
      setUploadState("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Upload failed. Please try again."
      );
    }
  }, []);

  // ── File input change ──────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset the input value so re-selecting the same file still fires onChange
    e.target.value = "";
  };

  // ── Drag events ────────────────────────────────────────────────────────────

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) setUploadState("dragging");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) setUploadState("idle");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    } else {
      setUploadState("idle");
    }
  };

  // ── Clear / remove ─────────────────────────────────────────────────────────

  const handleClear = () => {
    setUploadedUrl(null);
    setUploadState("idle");
    setErrorMsg(null);
    dragCounterRef.current = 0;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Derived helpers ────────────────────────────────────────────────────────

  const isDragging = uploadState === "dragging";
  const isUploading = uploadState === "uploading";
  const isDone = uploadState === "done";
  const isError = uploadState === "error";

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">
        Product Image
      </label>

      {/* Hidden file input — browser pick fallback */}
      <input
        ref={fileInputRef}
        type="file"
        name="imageFile"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Choose product image"
      />

      {/* Hidden URL input — carries the already-uploaded path to the Server Action */}
      <input
        type="hidden"
        name="existingImageUrl"
        value={uploadedUrl ?? ""}
      />

      {/* ── Drop Zone ─────────────────────────────────────────────────────── */}
      {isDone ? (
        /* Preview state — show the image with a remove overlay */
        <div className="relative group w-full rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-800/40 aspect-[4/3] max-h-52">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={uploadedUrl!}
            alt="Product preview"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Change Image
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-all active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* Drop zone — idle / dragging / uploading / error */
        <div
          role="button"
          tabIndex={0}
          aria-label="Drop image here or click to browse"
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (!isUploading && (e.key === "Enter" || e.key === " ")) {
              fileInputRef.current?.click();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none
            flex flex-col items-center justify-center gap-3 py-8 px-4 text-center
            ${isDragging
              ? "border-indigo-400 bg-indigo-500/10 scale-[1.01]"
              : isError
              ? "border-red-500/60 bg-red-500/5"
              : "border-slate-700/60 bg-slate-800/30 hover:border-indigo-500/50 hover:bg-slate-800/50"
            }
            ${isUploading ? "pointer-events-none" : ""}
          `}
        >
          {/* Icon / Spinner */}
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center transition-all
            ${isDragging ? "bg-indigo-500/20" : isError ? "bg-red-500/10" : "bg-slate-700/40"}
          `}>
            {isUploading ? (
              <svg className="w-6 h-6 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : isError ? (
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            ) : isDragging ? (
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>

          {/* Text */}
          {isUploading ? (
            <p className="text-sm font-medium text-indigo-400">Uploading image…</p>
          ) : isError ? (
            <div>
              <p className="text-sm font-semibold text-red-400">Upload failed</p>
              <p className="text-xs text-red-400/70 mt-0.5 max-w-[260px]">{errorMsg}</p>
              <p className="text-xs text-slate-500 mt-2">Click or drop to try again</p>
            </div>
          ) : isDragging ? (
            <p className="text-sm font-semibold text-indigo-300">Drop to upload</p>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-300">
                <span className="text-indigo-400 font-semibold">Click to browse</span>
                {" "}or drag &amp; drop
              </p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP, GIF, SVG · max 4 MB</p>
            </div>
          )}

          {/* Progress bar (only visible while uploading) */}
          {isUploading && (
            <div className="w-full max-w-[200px] h-1 rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
