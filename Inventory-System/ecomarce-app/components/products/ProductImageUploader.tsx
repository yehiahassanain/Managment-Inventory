"use client";

import { useState, useRef } from "react";

interface ProductImageUploaderProps {
  initialImageUrl?: string | null;
}

export default function ProductImageUploader({ initialImageUrl }: ProductImageUploaderProps) {
  const [prevInitial, setPrevInitial] = useState(initialImageUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (initialImageUrl !== prevInitial) {
    setPrevInitial(initialImageUrl);
    setPreviewUrl(initialImageUrl || null);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">
        Product Image
      </label>
      
      <div className="flex items-center gap-4">
        {/* Preview Container */}
        <div className="w-16 h-16 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center overflow-hidden shrink-0 relative group">
          {previewUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Product Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all active:scale-90"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {/* We also store a text input for when editing if the user did NOT choose a new image, to keep the old URL */}
          <input
            type="hidden"
            name="existingImageUrl"
            value={previewUrl && previewUrl.startsWith("/uploads/") ? previewUrl : ""}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Choose Image File
          </button>
          <p className="text-[10px] text-slate-500 mt-1">
            Supports PNG, JPG, WEBP.
          </p>
        </div>
      </div>
    </div>
  );
}
