import { Calendar, Phone, CreditCard, MapPinIcon, Check, Plus } from 'lucide-react';
import { User } from '@/types';
import { formatBillingAddressSummary } from '@/lib/nepalLocale';
import UserAvatar from '@/components/common/UserAvatar';

interface FieldsListProps {
  user: User | null;
  hasProfilePicture: boolean;
  hasDateOfBirth: boolean;
  hasVerifiedPhone: boolean;
  hasBankAccount: boolean;
  hasBillingAddress: boolean;
  onFieldClick: (field: string) => void;
}

export default function FieldsList({
  user,
  hasProfilePicture,
  hasDateOfBirth,
  hasVerifiedPhone,
  hasBankAccount,
  hasBillingAddress,
  onFieldClick
}: FieldsListProps) {
  return (
    <div className="space-y-1">
      {/* Profile Picture */}
      <div 
        onClick={() => onFieldClick('profile')}
        className="flex items-center gap-5 py-6 cursor-pointer hover:bg-surface-dim/20 -mx-10 px-10 transition-all"
      >
        <UserAvatar
          src={user?.profile_image}
          name={user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'User'}
          size="lg"
          verified={user?.is_verified_tasker}
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-brand-dark">Profile picture</h3>
        </div>
        {hasProfilePicture ? (
          <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white stroke-[3]" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-brand-emerald flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Date of Birth */}
      <div 
        onClick={() => onFieldClick('dob')}
        className="flex items-center gap-5 py-6 border-t border-outline-variant/30 cursor-pointer hover:bg-surface-dim/20 -mx-10 px-10 transition-all"
      >
        <div className="w-12 h-12 rounded-full bg-[#e8ecf4] flex items-center justify-center shrink-0">
          <Calendar className="w-6 h-6 text-[#6b7c93]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-brand-dark mb-0.5">Date of birth</h3>
          {hasDateOfBirth && user?.date_of_birth && (
            <p className="text-sm text-on-surface-variant">
              {new Date(user.date_of_birth).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
        {hasDateOfBirth ? (
          <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white stroke-[3]" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-brand-emerald flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Verify Mobile */}
      <div 
        onClick={() => onFieldClick('mobile')}
        className="flex items-center gap-5 py-6 border-t border-outline-variant/30 cursor-pointer hover:bg-surface-dim/20 -mx-10 px-10 transition-all"
      >
        <div className="w-12 h-12 rounded-full bg-[#e8ecf4] flex items-center justify-center shrink-0">
          <Phone className="w-6 h-6 text-[#6b7c93]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-brand-dark">
            Verify your mobile <span className="text-sm text-on-surface-variant font-normal">(Optional)</span>
          </h3>
          {hasVerifiedPhone && user?.phone_number && (
            <p className="text-sm text-on-surface-variant">{user.phone_number}</p>
          )}
        </div>
        {hasVerifiedPhone ? (
          <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white stroke-[3]" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-brand-emerald flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Link Bank Account */}
      <div 
        onClick={() => onFieldClick('bank')}
        className="flex items-center gap-5 py-6 border-t border-outline-variant/30 cursor-pointer hover:bg-surface-dim/20 -mx-10 px-10 transition-all"
      >
        <div className="w-12 h-12 rounded-full bg-[#e8ecf4] flex items-center justify-center shrink-0">
          <CreditCard className="w-6 h-6 text-[#6b7c93]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-brand-dark">Link your bank account</h3>
        </div>
        {hasBankAccount ? (
          <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white stroke-[3]" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-brand-emerald flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Add Billing Address */}
      <div 
        onClick={() => onFieldClick('address')}
        className="flex items-center gap-5 py-6 border-t border-outline-variant/30 cursor-pointer hover:bg-surface-dim/20 -mx-10 px-10 transition-all"
      >
        <div className="w-12 h-12 rounded-full bg-[#e8ecf4] flex items-center justify-center shrink-0">
          <MapPinIcon className="w-6 h-6 text-[#6b7c93]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-brand-dark">Add your billing address</h3>
          {hasBillingAddress && (user?.city || user?.address) && (
            <p className="text-sm text-on-surface-variant">
              {formatBillingAddressSummary({
                address: user.address,
                city: user.city,
                state: user.state,
                postal_code: user.postal_code,
                country: user.country,
              })}
            </p>
          )}
        </div>
        {hasBillingAddress ? (
          <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white stroke-[3]" />
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-brand-emerald flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
