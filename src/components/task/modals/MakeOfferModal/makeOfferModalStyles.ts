import {
  landingBody,
  landingHeadline,
  landingHeadlineSm,
  landingBodyMuted,
} from '@/components/LangingHome/landingTypography';

/** Root wrapper — Manrope body + Formula on headings */
export const OFFER_MODAL_TYPO = `${landingBody} antialiased`;

export const offerModalTitle = `${landingHeadline} text-brand-dark text-2xl sm:text-[1.75rem] leading-tight`;
export const offerModalTitleLight = `${landingHeadline} text-white text-2xl sm:text-[1.75rem] leading-tight`;

export const offerModalSectionTitle = `${landingHeadlineSm} text-brand-dark text-lg`;

export const offerModalSubtitle = `${landingBodyMuted} text-sm sm:text-base leading-relaxed`;
export const offerModalSubtitleLight =
  'font-body text-white/75 text-sm sm:text-base font-medium leading-relaxed';

export const offerLabel = 'font-body text-sm font-semibold text-brand-dark';

export const offerInputClass =
  'w-full px-4 py-3 border border-[#e2e8f4] rounded-2xl bg-white font-body text-brand-dark placeholder:text-[#6a719a]/60 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-emerald/25 focus:border-brand-emerald/50 transition-all';

export const offerTextareaClass = `${offerInputClass} resize-none`;

export const offerBtnPrimary =
  'w-full py-3.5 bg-brand-emerald text-white font-formula font-bold tracking-tight rounded-full hover:bg-brand-dark shadow-[0_8px_24px_-8px_rgba(69,168,116,0.45)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none';

export const offerBtnPrimarySm =
  'px-6 py-3 bg-brand-emerald text-white font-formula font-bold tracking-tight rounded-full hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed';

export const offerBtnGhost =
  'font-body font-semibold text-brand-emerald hover:underline disabled:opacity-50';

export const offerBackBtn =
  'inline-flex items-center gap-1.5 font-body font-semibold text-brand-emerald text-sm hover:bg-brand-emerald/5 px-2 py-1 -ml-2 rounded-lg transition-colors mb-5';

export const offerCard =
  'rounded-2xl border border-[#e8ecf4] bg-[#f8f9fc] p-4 sm:p-5';

export const offerInfoBanner =
  'rounded-2xl border border-brand-emerald/15 bg-brand-emerald/5 p-4 flex items-start gap-3';

export const offerFieldRow =
  'flex items-center gap-4 p-4 rounded-2xl border border-[#e8ecf4] bg-white cursor-pointer hover:border-brand-emerald/25 hover:shadow-[0_8px_24px_-16px_rgba(25,62,50,0.2)] transition-all group';
