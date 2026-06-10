'use client';

import Link from 'next/link';
import { ArrowUpRight, Star } from 'lucide-react';
import { formatNPR } from '@/lib/nepalLocale';
import { getSellerMeta, type Service } from './serviceListData';
import { getServiceAuthorProfilePath } from './serviceSlug';

interface ServiceSellerCardProps {
  service: Service;
}

export default function ServiceSellerCard({ service }: ServiceSellerCardProps) {
  const seller = getSellerMeta(service);

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
      <Link
        href={getServiceAuthorProfilePath(service)}
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
          <p className="text-[17px] font-normal text-black hover:text-[#52C47F]">{service.author.name}</p>
          <p className="mt-0.5 text-[15px] font-normal text-neutral-500">{seller.role}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[15px] font-normal text-black">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>{service.rating.toFixed(1)}</span>
            <span className="text-neutral-500">({service.reviews} reviews)</span>
          </div>
        </div>
      </Link>

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-black pt-5 text-center">
        <div>
          <p className="text-xs font-normal text-neutral-400">Location</p>
          <p className="mt-1.5 text-sm font-normal text-black">{seller.location}</p>
        </div>
        <div>
          <p className="text-xs font-normal text-neutral-400">Rate</p>
          <p className="mt-1.5 text-sm font-normal text-black">{formatNPR(seller.hourlyRate)} / hr</p>
        </div>
        <div>
          <p className="text-xs font-normal text-neutral-400">Job Success</p>
          <p className="mt-1.5 text-sm font-normal text-black">%{seller.jobSuccess}</p>
        </div>
      </div>

      <button
        type="button"
        className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-[#52C47F] bg-white px-6 py-3.5 text-[15px] font-normal text-[#52C47F] transition-colors hover:bg-[#52C47F] hover:text-white"
      >
        Contact Me
        <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
      </button>
    </div>
  );
}
