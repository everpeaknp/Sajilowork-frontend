'use client';

import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, CheckCircle2, Send, Star, X } from 'lucide-react';
import { formatNPR } from '@/lib/nepalLocale';
import UserAvatar from '@/components/common/UserAvatar';
import { getSellerMeta, type Service } from './serviceListData';
import ServiceAuthorLink from './ServiceAuthorLink';

interface ServiceSellerCardProps {
  service: Service;
  onContact?: (name: string, message: string) => void | Promise<void | boolean>;
}

export default function ServiceSellerCard({ service, onContact }: ServiceSellerCardProps) {
  const seller = getSellerMeta(service);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [contactSending, setContactSending] = useState(false);

  const handleMessageSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim() || contactSending) {
      return;
    }

    setContactSending(true);
    try {
      const result = await onContact?.(service.author.name, contactMessage.trim());
      if (result === false) {
        return;
      }
      setMessageSent(true);
      setTimeout(() => {
        setContactMessage('');
        setShowContactModal(false);
        setMessageSent(false);
      }, 2500);
    } finally {
      setContactSending(false);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <ServiceAuthorLink
          service={service}
          className="flex items-start gap-3.5 transition-opacity hover:opacity-80"
        >
          <div className="relative shrink-0">
            <img
              src={service.author.avatar}
              alt={service.author.name}
              className="h-14 w-14 rounded-full border border-neutral-100 object-cover"
              referrerPolicy="no-referrer"
            />
            {service.author.online ? (
              <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#52C47F]" />
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="text-[17px] font-normal text-black hover:text-[#52C47F]">
              {service.author.name}
            </p>
            <p className="mt-0.5 text-[15px] font-normal text-neutral-500">{seller.role}</p>
            <div className="mt-2 flex items-center gap-1.5 text-[15px] font-normal text-black">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>{service.rating.toFixed(1)}</span>
              <span className="text-neutral-500">({service.reviews} reviews)</span>
            </div>
          </div>
        </ServiceAuthorLink>

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-black pt-5 text-center">
          <div>
            <p className="text-xs font-normal text-neutral-400">Location</p>
            <p className="mt-1.5 text-sm font-normal text-black">{seller.location}</p>
          </div>
          <div>
            <p className="text-xs font-normal text-neutral-400">Rate</p>
            <p className="mt-1.5 text-sm font-normal text-black">
              {formatNPR(seller.hourlyRate)} / hr
            </p>
          </div>
          <div>
            <p className="text-xs font-normal text-neutral-400">Job Success</p>
            <p className="mt-1.5 text-sm font-normal text-black">%{seller.jobSuccess}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowContactModal(true)}
          className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-[#52C47F] bg-white px-6 py-3.5 text-[15px] font-normal text-[#52C47F] transition-colors hover:bg-[#52C47F] hover:text-white"
        >
          Contact Me
          <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

      <AnimatePresence>
        {showContactModal ? (
          <div
            className="fixed inset-0 z-[3000] flex items-center justify-center overflow-hidden bg-black/40 p-4 backdrop-blur-sm"
            onClick={() => {
              setShowContactModal(false);
              setMessageSent(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setShowContactModal(false);
                  setMessageSent(false);
                }}
                className="absolute right-5 top-5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 transition-colors hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>

              {messageSent ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-500">
                    <CheckCircle2 className="h-6 w-6 animate-bounce" />
                  </div>
                  <h4 className="text-lg font-normal text-black">Message sent successfully!</h4>
                  <p className="mx-auto mt-1 max-w-xs text-xs font-normal leading-relaxed text-neutral-400">
                    {service.author.name} will receive your message. You can continue the
                    conversation in your inbox.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleMessageSubmit} className="flex flex-col">
                  <div className="mb-5 flex items-center gap-3.5">
                    <UserAvatar
                      src={service.author.avatar || undefined}
                      name={service.author.name}
                      alt={service.author.name}
                      size="sm"
                      className="h-10 w-10 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-normal text-black">
                        Contact {service.author.name}
                      </h4>
                      <p className="mt-0.5 text-[11px] font-normal text-neutral-400">
                        About: {service.title}
                      </p>
                    </div>
                  </div>

                  <label className="mb-2 block text-xs font-normal text-black">
                    Write your inquiry or questions about this service:
                  </label>
                  <textarea
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Ask about delivery time, package details, or your project requirements..."
                    className="min-h-[120px] w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 text-xs font-normal text-black outline-none transition-all focus:border-[#52C47F] focus:ring-1 focus:ring-[#52C47F]/40"
                  />

                  <div className="mt-5 flex items-center justify-end gap-3.5">
                    <button
                      type="button"
                      onClick={() => setShowContactModal(false)}
                      className="cursor-pointer rounded-lg border border-neutral-200 px-4 py-2.5 text-xs font-normal text-neutral-500 transition-colors hover:bg-neutral-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={contactSending}
                      className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#52C47F] px-5 py-2.5 text-xs font-normal text-white shadow-sm transition-all hover:bg-[#43a86c] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{contactSending ? 'Sending…' : 'Send message'}</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
