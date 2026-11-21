"use client";

import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import { Spinner } from "./Loader";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  tone = "danger",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={loading ? () => {} : onClose} title={title} size="sm">
      <div className="flex gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
            tone === "danger" ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-700"
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="text-sm leading-relaxed text-stone-600">{message}</div>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button className="btn-outline" onClick={onClose} disabled={loading}>
          Go back
        </button>
        <button className={tone === "danger" ? "btn-danger" : "btn-primary"} onClick={onConfirm} disabled={loading}>
          {loading && <Spinner />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
