'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  disputeService,
  type DisputeType,
} from '@/services/dispute.service';

const DISPUTE_TYPES: { value: DisputeType; label: string }[] = [
  { value: 'quality', label: 'Quality issue' },
  { value: 'incomplete', label: 'Incomplete work' },
  { value: 'deadline', label: 'Deadline missed' },
  { value: 'payment', label: 'Payment issue' },
  { value: 'communication', label: 'Communication problem' },
  { value: 'other', label: 'Other' },
];

interface DisputeModalProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  againstUserId: string;
  taskTitle?: string;
  onCreated?: () => void;
}

export default function DisputeModal({
  open,
  onClose,
  taskId,
  againstUserId,
  taskTitle,
  onCreated,
}: DisputeModalProps) {
  const [disputeType, setDisputeType] = useState<DisputeType>('quality');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open || typeof document === 'undefined') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || description.trim().length < 20) {
      toast.error('Add a title and a description (at least 20 characters).');
      return;
    }
    setSubmitting(true);
    try {
      const res = await disputeService.create({
        task: taskId,
        against: againstUserId,
        dispute_type: disputeType,
        title: title.trim(),
        description: description.trim(),
      });
      if (res.success) {
        toast.success('Dispute submitted. Our team will review it.');
        setTitle('');
        setDescription('');
        onCreated?.();
        onClose();
      } else {
        toast.error(res.message || 'Could not submit dispute.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not submit dispute.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-[#0a1452]">Raise a dispute</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {taskTitle && (
          <p className="mb-4 text-sm text-gray-500">
            Task: <span className="font-medium text-gray-700">{taskTitle}</span>
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">Type</label>
            <select
              value={disputeType}
              onChange={(e) => setDisputeType(e.target.value as DisputeType)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
            >
              {DISPUTE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              placeholder="Brief summary"
              maxLength={120}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-600">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              placeholder="Describe what went wrong and what outcome you expect…"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-[#005fff] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0047ff] disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit dispute
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
