/** Shared styles for on-screen receipt + print/PDF HTML export */
export const RECEIPT_DOCUMENT_STYLES = `
.tn-receipt {
  font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: #111827;
  background: #fff;
  line-height: 1.5;
}
.tn-receipt-accent {
  height: 4px;
  background: linear-gradient(90deg, #52C47F 0%, #3daf6c 50%, #2d9658 100%);
}
.tn-receipt-inner { padding: 28px 32px 32px; }
.tn-receipt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 28px;
}
.tn-receipt-brand-name {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #111827;
  margin: 0;
}
.tn-receipt-brand-meta {
  margin: 6px 0 0;
  font-size: 11px;
  color: #6b7280;
  line-height: 1.6;
}
.tn-receipt-meta-block { text-align: right; flex-shrink: 0; }
.tn-receipt-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #9ca3af;
  margin: 0 0 4px;
}
.tn-receipt-id {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}
.tn-receipt-date {
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0 0;
}
.tn-receipt-divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 0 0 24px;
}
.tn-receipt-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
.tn-receipt-payment-details {
  margin-bottom: 24px;
}
@media (max-width: 480px) {
  .tn-receipt-grid { grid-template-columns: 1fr; }
  .tn-receipt-inner { padding: 20px; }
  .tn-receipt-meta-block { text-align: left; }
  .tn-receipt-header { flex-direction: column; }
}
.tn-receipt-section-title {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9ca3af;
  margin: 0 0 10px;
}
.tn-receipt-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}
.tn-receipt-sub {
  font-size: 12px;
  color: #6b7280;
  margin: 4px 0 0;
}
.tn-receipt-status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.tn-receipt-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}
.tn-receipt-badge--success { background: #ecfdf5; color: #047857; }
.tn-receipt-badge--pending { background: #fffbeb; color: #b45309; }
.tn-receipt-badge--failed { background: #fef2f2; color: #b91c1c; }
.tn-receipt-badge--neutral { background: #f3f4f6; color: #4b5563; }
.tn-receipt-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.tn-receipt-desc-box {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 20px;
  background: #fafafa;
}
.tn-receipt-desc-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}
.tn-receipt-desc-ref {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  color: #6b7280;
  margin: 8px 0 0;
  word-break: break-all;
}
.tn-receipt-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}
.tn-receipt-table thead th {
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6b7280;
  background: #f9fafb;
  padding: 12px 18px;
  border-bottom: 1px solid #e5e7eb;
}
.tn-receipt-table thead th:last-child { text-align: right; }
.tn-receipt-table tbody td {
  padding: 12px 18px;
  font-size: 13px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
}
.tn-receipt-table tbody td:last-child {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tn-receipt-table tbody tr:last-child td { border-bottom: none; }
.tn-receipt-table tfoot td {
  padding: 16px 18px;
  border-top: 2px solid #e5e7eb;
  background: #f9fafb;
}
.tn-receipt-total-label {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}
.tn-receipt-total-value {
  text-align: right;
  font-size: 18px;
  font-weight: 800;
  color: #059669;
  font-variant-numeric: tabular-nums;
}
.tn-receipt-footer {
  border-top: 1px dashed #d1d5db;
  padding-top: 18px;
  margin-top: 4px;
}
.tn-receipt-footer-id {
  font-size: 11px;
  color: #6b7280;
  margin: 0 0 8px;
  word-break: break-all;
}
.tn-receipt-footer-id span {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  color: #374151;
}
.tn-receipt-footer-note {
  font-size: 10px;
  color: #9ca3af;
  line-height: 1.6;
  margin: 0;
}
.tn-receipt-stamp {
  position: absolute;
  top: 50%;
  right: 12%;
  transform: translateY(-50%) rotate(-12deg);
  pointer-events: none;
  opacity: 0.12;
  border: 3px solid #059669;
  border-radius: 8px;
  padding: 8px 20px;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #059669;
}
.tn-receipt-body-wrap { position: relative; overflow: hidden; }
`;
