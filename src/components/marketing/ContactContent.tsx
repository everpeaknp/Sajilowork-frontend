'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  CheckCircle,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Navigation,
} from 'lucide-react';

interface OfficeLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  region: string;
}

const OFFICE_LOCATIONS: OfficeLocation[] = [
  {
    id: 'kathmandu',
    name: 'Kathmandu Headquarters',
    address: 'Lazimpat Road, Kathmandu 44600, Nepal.',
    phone: '+977 1-4001234',
    email: 'support@sajilowork.com',
    region: 'Bagmati Province',
  },
];

export default function ContactContent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  const [selectedLocationId] = useState<string>('kathmandu');
  const [showPopup, setShowPopup] = useState(true);
  const [zoom, setZoom] = useState(15);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'terrain'>('streets');

  const activeOffice =
    OFFICE_LOCATIONS.find((loc) => loc.id === selectedLocationId) ?? OFFICE_LOCATIONS[0];

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 1, 21));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 1, 5));
  };

  const handleResetMap = () => {
    setZoom(15);
    setMapStyle('streets');
    setShowPopup(true);
  };

  const getEmbedUrl = () => {
    const query = encodeURIComponent(activeOffice.address);
    let tParam = 'm';
    if (mapStyle === 'satellite') tParam = 'k';
    if (mapStyle === 'terrain') tParam = 'p';
    return `https://maps.google.com/maps?q=${query}&t=${tParam}&z=${zoom}&output=embed`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    // Clear previous errors
    setFieldErrors({});
    setIsSubmitting(true);
    
    try {
      const { contactService } = await import('@/services/contact.service');
      await contactService.submitContactForm({
        name,
        email,
        message,
      });
      
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
      toast.success('Message sent successfully! Our team will connect back shortly.');
    } catch (err: unknown) {
      const apiErr = err as {
        status?: number;
        message?: string;
        errors?: Record<string, string[]>;
      };

      const nextFieldErrors: { name?: string; email?: string; message?: string } = {};

      if (apiErr?.errors && typeof apiErr.errors === 'object') {
        for (const [key, messages] of Object.entries(apiErr.errors)) {
          if (messages?.[0] && (key === 'name' || key === 'email' || key === 'message')) {
            nextFieldErrors[key] = messages[0];
          }
        }
        setFieldErrors(nextFieldErrors);
      }

      const toastMessage =
        nextFieldErrors.message ||
        nextFieldErrors.name ||
        nextFieldErrors.email ||
        apiErr?.message ||
        'Failed to send message. Please try again.';

      toast.error(toastMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full min-w-0 select-none" id="contact-section">
      <div className="w-full">
        <div className="relative w-full px-4 pt-4 sm:px-6 sm:pt-6 md:px-10 lg:px-12 xl:px-16">
          <div className="relative mx-auto flex w-full max-w-[1600px] flex-col lg:block lg:min-h-[36rem]">
          <div className="relative z-0 order-1 w-full overflow-hidden rounded-3xl bg-brand-dark sm:rounded-[2rem]">
            <div className="pointer-events-none absolute left-[-40px] top-[-40px] h-48 w-48 rounded-full bg-[#fcd074]/95 opacity-90 mix-blend-normal" />
            <div className="pointer-events-none absolute bottom-[-20px] left-[-30px] h-36 w-36 rounded-full border-4 border-brand-dark bg-brand-dark/40" />
            <div
              className="pointer-events-none absolute bottom-[-30px] right-[-30px] h-56 w-56 rounded-full bg-[#ffa07a]/90 opacity-90 mix-blend-normal"
              style={{ borderRadius: '46% 54% 50% 50% / 50% 40% 60% 50%' }}
            />

            <div className="relative z-10 w-full px-4 py-7 sm:px-6 sm:py-8 lg:px-10 lg:py-9 xl:px-12">
              <div className="max-w-[260px] text-left sm:max-w-xs sm:ml-14 lg:max-w-sm lg:ml-24 xl:ml-32">
                <motion.h2
                  className="mb-1.5 text-2xl font-normal tracking-tight text-white sm:text-3xl lg:text-4xl"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Contact us
                </motion.h2>
                <motion.p
                  className="text-sm font-normal leading-snug text-white/80 sm:text-[15px]"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  We&apos;d love to talk about how we can help you with tasks, payments, and your
                  account.
                </motion.p>
              </div>
            </div>
          </div>

            <motion.div
              className="relative z-20 order-3 mt-6 w-full rounded-3xl border border-neutral-100 bg-white p-6 text-left shadow-xl sm:rounded-[2rem] sm:p-8 lg:absolute lg:right-32 lg:top-24 lg:order-none lg:mt-0 lg:max-w-[480px] lg:-translate-y-[6%] lg:p-8 xl:right-44 2xl:right-52"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
                <h3 className="mb-1.5 font-sans text-xl font-normal tracking-tight text-black">
                  Tell us about yourself
                </h3>
                <p className="mb-6 text-sm font-normal leading-relaxed text-neutral-900 sm:mb-7 sm:text-base">
                  Whether you have questions or you would just like to say hello, contact us.
                </p>

                <AnimatePresence>
                  {submitted ? (
                    <motion.div
                      className="mb-5 flex items-start gap-3.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <div>
                        <h4 className="text-sm font-normal text-emerald-900">
                          Message sent successfully!
                        </h4>
                        <p className="mt-0.5 text-xs font-normal text-emerald-800">
                          Our team will connect back shortly.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="ml-auto cursor-pointer text-xs font-normal text-emerald-800 underline transition-colors hover:text-emerald-900"
                      >
                        Dismiss
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="form-name"
                        className="mb-1.5 block text-xs font-normal text-black sm:text-sm"
                      >
                        Name
                      </label>
                      <input
                        id="form-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (fieldErrors.name) {
                            setFieldErrors({ ...fieldErrors, name: undefined });
                          }
                        }}
                        placeholder="Name"
                        className={`w-full rounded-lg border ${
                          fieldErrors.name
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-neutral-200 focus:border-brand-emerald focus:ring-brand-emerald/20'
                        } bg-white px-3.5 py-2.5 text-sm font-normal text-black placeholder-neutral-400 transition-all focus:outline-none focus:ring-2`}
                      />
                      {fieldErrors.name && (
                        <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="form-email"
                        className="mb-1.5 block text-xs font-normal text-black sm:text-sm"
                      >
                        Email
                      </label>
                      <input
                        id="form-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) {
                            setFieldErrors({ ...fieldErrors, email: undefined });
                          }
                        }}
                        placeholder="Enter Email"
                        className={`w-full rounded-lg border ${
                          fieldErrors.email
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-neutral-200 focus:border-brand-emerald focus:ring-brand-emerald/20'
                        } bg-white px-3.5 py-2.5 text-sm font-normal text-black placeholder-neutral-400 transition-all focus:outline-none focus:ring-2`}
                      />
                      {fieldErrors.email && (
                        <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="form-message"
                      className="mb-1.5 block text-xs font-normal text-black sm:text-sm"
                    >
                      Message
                    </label>
                    <textarea
                      id="form-message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (fieldErrors.message) {
                          setFieldErrors({ ...fieldErrors, message: undefined });
                        }
                      }}
                      placeholder="How can we help?"
                      className={`min-h-[120px] w-full resize-y rounded-lg border ${
                        fieldErrors.message
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-neutral-200 focus:border-brand-emerald focus:ring-brand-emerald/20'
                      } bg-white px-3.5 py-3 text-sm font-normal text-black placeholder-neutral-400 transition-all focus:outline-none focus:ring-2 sm:min-h-[140px]`}
                    />
                    {fieldErrors.message && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-emerald px-6 py-3 text-sm font-normal tracking-tight text-white shadow-sm transition-all hover:bg-[#3d9665] focus:outline-none disabled:opacity-75 sm:w-auto"
                  >
                    <span>{isSubmitting ? 'Sending...' : 'Send message'}</span>
                    <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </form>
            </motion.div>

          <div className="relative z-10 order-2 max-w-lg px-4 pb-0 pt-6 sm:px-6 sm:ml-14 md:px-10 lg:order-none lg:ml-24 lg:max-w-md lg:px-10 lg:pr-[min(520px,46%)] xl:ml-32 xl:px-12">
            <h3 className="mb-3 font-sans text-2xl font-normal tracking-tight text-black">Keep in touch with us</h3>
            <p className="mb-8 max-w-sm text-sm font-normal leading-relaxed text-neutral-900">
              Reach our Kathmandu team for support with posting tasks, payments, disputes, and
              account questions. Check the{' '}
              <Link href="/faq" className="font-normal text-black underline underline-offset-2 hover:text-neutral-700">
                FAQ
              </Link>{' '}
              for quick answers first.
            </p>

            <div className="mb-7 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-normal text-black">
                <span className="h-2 w-2 animate-pulse rounded-full bg-brand-emerald" />
                Kathmandu Main Office
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                  <MapPin className="h-5 w-5 stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="mb-1 font-sans text-sm font-normal leading-none text-black">
                    Address{' '}
                    <span className="text-[11px] font-normal text-neutral-600">
                      ({activeOffice.region})
                    </span>
                  </h4>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={activeOffice.id}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-normal leading-relaxed text-black sm:text-sm"
                    >
                      {activeOffice.address}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                  <Phone className="h-5 w-5 stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="mb-1 font-sans text-sm font-normal leading-none text-black">
                    Phone
                  </h4>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={activeOffice.id}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-normal text-black sm:text-sm"
                    >
                      {activeOffice.phone}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                  <Mail className="h-5 w-5 stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="mb-1 font-sans text-sm font-normal leading-none text-black">
                    Email
                  </h4>
                  <AnimatePresence mode="wait">
                    <motion.a
                      key={activeOffice.id}
                      href={`mailto:${activeOffice.email}`}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-normal text-black underline underline-offset-2 hover:text-neutral-700 sm:text-sm"
                    >
                      {activeOffice.email}
                    </motion.a>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1600px] border-t border-neutral-100 bg-white px-4 pb-10 pt-6 sm:px-6 sm:pt-8 md:px-10 lg:px-12 lg:pb-14 lg:pt-8 xl:px-16">
          <div className="relative flex min-h-[400px] flex-col items-stretch lg:min-h-[460px]">
            <div className="relative flex h-full min-h-[400px] w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 shadow-sm lg:min-h-[460px]">
              <iframe
                src={getEmbedUrl()}
                width="100%"
                height="100%"
                className="absolute inset-0 z-0 h-full w-full border-0 bg-neutral-100"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={activeOffice.name}
              />

              <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-1 rounded-lg border border-neutral-200/60 bg-white/95 px-1.5 py-1.5 shadow-md backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setMapStyle('streets')}
                    className={`cursor-pointer rounded px-2.5 py-1 text-[10px] font-normal transition-all ${
                      mapStyle === 'streets'
                        ? 'bg-brand-dark text-white'
                        : 'text-neutral-500 hover:bg-neutral-100 hover:text-black'
                    }`}
                  >
                    Streets
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapStyle('satellite')}
                    className={`cursor-pointer rounded px-2.5 py-1 text-[10px] font-normal transition-all ${
                      mapStyle === 'satellite'
                        ? 'bg-brand-dark text-white'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                    }`}
                  >
                    Satellite
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapStyle('terrain')}
                    className={`cursor-pointer rounded px-2.5 py-1 text-[10px] font-normal transition-all ${
                      mapStyle === 'terrain'
                        ? 'bg-brand-dark text-white'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                    }`}
                  >
                    Terrain
                  </button>
                </div>

                <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200/60 bg-white/95 shadow-md backdrop-blur-md">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center border-b border-neutral-200 transition-colors hover:bg-neutral-100"
                    title="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4 text-neutral-600" />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center border-b border-neutral-200 transition-colors hover:bg-neutral-100"
                    title="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4 text-neutral-600" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetMap}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center transition-all hover:bg-neutral-100"
                    title="Reset map"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-neutral-400 hover:text-neutral-700" />
                  </button>
                </div>
              </div>

              {showPopup ? (
                <div className="absolute bottom-3 left-3 right-3 z-10 rounded-xl border border-neutral-200/50 bg-white/95 p-4 shadow-lg backdrop-blur-md">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-brand-emerald">
                        <Navigation className="h-4 w-4 animate-bounce" />
                      </div>
                      <div>
                        <h4 className="text-xs font-normal leading-snug text-black">
                          {activeOffice.name}
                        </h4>
                        <p className="mt-1 text-[11px] font-normal leading-relaxed text-neutral-900">
                          {activeOffice.address}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px]">
                          <span className="font-normal text-black">{activeOffice.phone}</span>
                          <span className="hidden h-1.5 w-1.5 rounded-full bg-neutral-300 sm:inline" />
                          <span className="font-normal text-black">{activeOffice.email}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPopup(false)}
                      className="cursor-pointer p-1 text-lg font-normal leading-none text-neutral-400 transition-colors hover:text-black"
                      title="Hide card"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPopup(true)}
                  className="absolute bottom-3 right-3 z-10 flex cursor-pointer items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-[11px] font-normal text-white shadow-md transition-colors hover:bg-neutral-800"
                >
                  <MapPin className="h-3.5 w-3.5 text-brand-emerald" />
                  Show details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      </section>
  );
}
