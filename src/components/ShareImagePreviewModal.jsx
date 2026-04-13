import React from "react";

export default function ShareImagePreviewModal({
  open,
  imageUrl,
  loading,
  error,
  title,
  loadingText,
  saveText,
  closeText,
  onClose,
  onDownload,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2f2721]/55 px-4 pb-4 pt-8 backdrop-blur-[2px] sm:items-center">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-[32px] border border-[#eadfce] bg-[#fffaf3] shadow-[0_24px_80px_rgba(47,39,33,0.22)]">
        <div className="flex items-center justify-between border-b border-[#eee2d4] px-5 py-4">
          <div className="text-[18px] font-semibold text-[#2f2721]">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e2d4c3] text-[#6d5d51]"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4">
          <div className="rounded-[24px] bg-[#f7efe3] p-3">
            {loading ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#d8c4b0] border-t-[#b97d59]" />
                <div className="text-sm text-[#6d5d51]">{loadingText}</div>
              </div>
            ) : null}

            {!loading && error ? (
              <div className="flex min-h-[300px] items-center justify-center px-6 text-center text-sm leading-7 text-[#7d6758]">
                {error}
              </div>
            ) : null}

            {!loading && !error && imageUrl ? (
              <img
                src={imageUrl}
                alt="share preview"
                className="block w-full rounded-[22px] border border-[#eadfce] bg-white"
              />
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-[#eee2d4] px-4 py-4">
          <button
            type="button"
            onClick={onDownload}
            disabled={!imageUrl || loading}
            className="rounded-[20px] bg-[#2f2721] px-4 py-3 text-sm font-medium text-[#f8f2e8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saveText}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[20px] border border-[#d8c9b7] bg-[#fffaf3] px-4 py-3 text-sm font-medium text-[#3e332c]"
          >
            {closeText}
          </button>
        </div>
      </div>
    </div>
  );
}
