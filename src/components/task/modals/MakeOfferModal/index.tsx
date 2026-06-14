"use client";

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/store/auth.store';
import { userService, paymentService } from '@/services';
import { toast } from 'sonner';
import { notifyUserProfileUpdated, normalizeUserFromApi } from '@/lib/userProfileSync';
import { User } from '@/types';
import ModalHeader from './ModalHeader';
import FieldsList from './FieldsList';
import ProfilePictureForm from './ProfilePictureForm';
import DateOfBirthForm from './DateOfBirthForm';
import VerifyMobileForm from './VerifyMobileForm';
import LinkBankAccountForm from './LinkBankAccountForm';
import BillingAddressForm from './BillingAddressForm';
import BidForm from './BidForm';
import JobApplyForm from './JobApplyForm';
import { Task } from '@/types';
import type { Project } from '@/components/projects/projectListData';
import type { Job } from '@/components/jobs/jobListData';
import { projectToOfferTask } from '@/components/projects/projectSlug';
import { jobToOfferTask } from '@/components/jobs/jobSlug';
import { DEFAULT_COUNTRY } from '@/lib/nepalLocale';

type ListingKind = 'task' | 'project' | 'job';

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  project?: Project;
  job?: Job;
  /** Called after a bid is submitted successfully (before close) */
  onBidSuccess?: () => void;
}

function resolveListingKind(task?: Task, project?: Project, job?: Job): ListingKind {
  if (job && !task && !project) return 'job';
  if (project && !task) return 'project';
  return 'task';
}

export default function MakeOfferModal({
  isOpen,
  onClose,
  task,
  project,
  job,
  onBidSuccess,
}: MakeOfferModalProps) {
  const listingKind = resolveListingKind(task, project, job);
  const offerTask =
    task ?? (project ? projectToOfferTask(project) : job ? jobToOfferTask(job) : undefined);
  const { user, refreshUser, setUser } = useAuthStore();

  const syncProfileAcrossApp = async (updatedUser?: User | Record<string, unknown>) => {
    if (updatedUser && typeof updatedUser === 'object' && 'id' in updatedUser) {
      setUser(normalizeUserFromApi(updatedUser as Record<string, unknown>));
    }
    await refreshUser();
    notifyUserProfileUpdated();
  };
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);
  
  // Form states
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [esewaFullName, setEsewaFullName] = useState('');
  const [esewaMobileNumber, setEsewaMobileNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [state, setState] = useState('');
  
  // Completion status
  const [hasProfilePicture, setHasProfilePicture] = useState(false);
  const [hasDateOfBirth, setHasDateOfBirth] = useState(false);
  const [hasVerifiedPhone, setHasVerifiedPhone] = useState(false);
  const [hasBankAccount, setHasBankAccount] = useState(false);
  const [hasBillingAddress, setHasBillingAddress] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null!);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setHasProfilePicture(!!user.profile_image);
      setHasDateOfBirth(!!user.date_of_birth);
      setHasVerifiedPhone(!!user.is_phone_verified);
      setHasBankAccount(!!user.has_payment_method);
      setHasBillingAddress(!!(user.address && user.city && user.postal_code));
      
      // Pre-fill form fields
      if (user.date_of_birth) setDateOfBirth(user.date_of_birth);
      if (user.phone_number) setPhoneNumber(user.phone_number);
      if (user.address) setStreetAddress(user.address);
      if (user.city) setCity(user.city);
      if (user.postal_code) setPostcode(user.postal_code);
      if (user.state) setState(user.state);
    }
  }, [user]);

  // Check if all required fields are completed (mobile verification is optional)
  const allFieldsCompleted = hasProfilePicture && hasDateOfBirth && hasBankAccount && hasBillingAddress;

  // Reset showBidForm when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowBidForm(false);
      setExpandedField(null);
    }
  }, [isOpen]);

  // Handlers
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await userService.uploadProfileImage(file);
      if (response.success) {
        setHasProfilePicture(true);
        await syncProfileAcrossApp(response.data);
        toast.success('Profile picture updated successfully');
        setExpandedField(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDateOfBirth = async () => {
    if (!dateOfBirth) {
      toast.error('Please select your date of birth');
      return;
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (age < 18 || (age === 18 && monthDiff < 0)) {
      toast.error('You must be 18 or older to use tasknepal');
      return;
    }

    setIsLoading(true);
    try {
      const response = await userService.updateDateOfBirth(dateOfBirth);
      if (response.success) {
        setHasDateOfBirth(true);
        await syncProfileAcrossApp(response.data);
        toast.success('Date of birth updated successfully');
        setExpandedField(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update date of birth');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await userService.sendPhoneVerificationCode(phoneNumber);
      if (response.success) {
        setShowVerificationInput(true);
        toast.success('Verification code sent to your phone');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await userService.verifyPhone(phoneNumber, verificationCode);
      if (response.success) {
        setHasVerifiedPhone(true);
        await syncProfileAcrossApp(response.data);
        toast.success('Phone number verified successfully');
        setExpandedField(null);
        setShowVerificationInput(false);
        setVerificationCode('');
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkBankAccount = async () => {
    if (!esewaFullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!esewaMobileNumber.trim()) {
      toast.error('Please enter your eSewa phone number');
      return;
    }

    const cleanedPhone = esewaMobileNumber.replace(/\s|-/g, '');
    if (!/^\d{10}$/.test(cleanedPhone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    if (!cleanedPhone.startsWith('97') && !cleanedPhone.startsWith('98')) {
      toast.error('eSewa phone number must start with 97 or 98');
      return;
    }

    setIsLoading(true);

    try {
      const response = await paymentService.linkESewaAccount({
        esewa_account_name: esewaFullName.trim(),
        esewa_phone_number: cleanedPhone,
        is_default: true,
      });

      if (response.success) {
        setHasBankAccount(true);
        await syncProfileAcrossApp();
        toast.success('eSewa account linked successfully');
        setExpandedField(null);
        setEsewaFullName('');
        setEsewaMobileNumber('');
      } else {
        toast.error('Failed to link eSewa account');
      }
    } catch (error: any) {
      if (error?.errors) {
        const errorMessages = Object.entries(error.errors)
          .map(([field, messages]) =>
            `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
          )
          .join('\n');
        toast.error(errorMessages);
      } else {
        toast.error(error.message || 'Failed to link eSewa account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBillingAddress = async () => {
    if (!streetAddress || !city || !postcode || !state) {
      toast.error('Please fill in all address fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await userService.updateBillingAddress({
        address: streetAddress,
        city,
        state,
        postal_code: postcode,
        country: DEFAULT_COUNTRY
      });
      if (response.success) {
        setHasBillingAddress(true);
        await syncProfileAcrossApp(response.data);
        toast.success('Billing address updated successfully');
        setExpandedField(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update billing address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToOffer = () => {
    if (!allFieldsCompleted) {
      toast.error('Please complete all required fields');
      return;
    }
    
    // Show the bid form instead of closing
    setShowBidForm(true);
  };

  const handleBidSuccess = () => {
    setShowBidForm(false);
    onBidSuccess?.();
    onClose();
  };

  const handleBidCancel = () => {
    setShowBidForm(false);
  };

  const modalTree = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — portaled to body so it sits above navbar/filter (TaskDetails is z-50) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[10050]"
            aria-hidden
          />

          {/* Centered dialog */}
          <div
            className="fixed inset-0 z-[10051] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-labelledby="make-offer-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-lg bg-white rounded-3xl shadow-2xl max-h-[min(90vh,calc(100dvh-2rem))] overflow-hidden flex flex-col mx-auto"
            >
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-10 py-10">
              {showBidForm && listingKind === 'job' && job ? (
                <JobApplyForm job={job} onSuccess={handleBidSuccess} onCancel={handleBidCancel} />
              ) : showBidForm && offerTask ? (
                <BidForm
                  task={offerTask}
                  listingKind={listingKind === 'project' ? 'project' : 'task'}
                  onSuccess={handleBidSuccess}
                  onCancel={handleBidCancel}
                />
              ) : showBidForm && !offerTask ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Task details are not available.</p>
                  <button
                    type="button"
                    onClick={handleBidCancel}
                    className="text-brand-emerald font-semibold hover:underline"
                  >
                    Go back
                  </button>
                </div>
              ) : !expandedField ? (
                <>
                  <ModalHeader listingKind={listingKind} />
                  <FieldsList
                    user={user}
                    hasProfilePicture={hasProfilePicture}
                    hasDateOfBirth={hasDateOfBirth}
                    hasVerifiedPhone={hasVerifiedPhone}
                    hasBankAccount={hasBankAccount}
                    hasBillingAddress={hasBillingAddress}
                    onFieldClick={setExpandedField}
                  />
                </>
              ) : (
                // Show individual field forms
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {expandedField === 'profile' && (
                    <ProfilePictureForm
                      user={user}
                      fileInputRef={fileInputRef}
                      isLoading={isLoading}
                      onBack={() => setExpandedField(null)}
                      onFileChange={handleProfilePictureUpload}
                    />
                  )}

                  {expandedField === 'dob' && (
                    <DateOfBirthForm
                      dateOfBirth={dateOfBirth}
                      isLoading={isLoading}
                      onBack={() => setExpandedField(null)}
                      onChange={setDateOfBirth}
                      onSubmit={handleUpdateDateOfBirth}
                    />
                  )}

                  {expandedField === 'mobile' && (
                    <VerifyMobileForm
                      phoneNumber={phoneNumber}
                      verificationCode={verificationCode}
                      showVerificationInput={showVerificationInput}
                      isLoading={isLoading}
                      onBack={() => setExpandedField(null)}
                      onPhoneChange={setPhoneNumber}
                      onCodeChange={setVerificationCode}
                      onSendCode={handleSendVerificationCode}
                      onVerify={handleVerifyPhone}
                    />
                  )}

                  {expandedField === 'bank' && (
                    <LinkBankAccountForm
                      fullName={esewaFullName}
                      mobileNumber={esewaMobileNumber}
                      isLoading={isLoading}
                      onBack={() => setExpandedField(null)}
                      onFullNameChange={setEsewaFullName}
                      onMobileNumberChange={setEsewaMobileNumber}
                      onSubmit={handleLinkBankAccount}
                    />
                  )}

                  {expandedField === 'address' && (
                    <BillingAddressForm
                      streetAddress={streetAddress}
                      city={city}
                      postcode={postcode}
                      state={state}
                      isLoading={isLoading}
                      onBack={() => setExpandedField(null)}
                      onStreetAddressChange={setStreetAddress}
                      onCityChange={setCity}
                      onPostcodeChange={setPostcode}
                      onStateChange={setState}
                      onSubmit={handleUpdateBillingAddress}
                    />
                  )}
                </motion.div>
              )}
            </div>

            {/* Modal Footer - Only show Continue button when not in bid form */}
            {!showBidForm && (
              <div className="px-10 py-6 bg-[#f8f9fb]">
                <button 
                  onClick={handleContinueToOffer}
                  disabled={!allFieldsCompleted}
                  className={`w-full py-4 font-bold text-lg rounded-full transition-all ${
                    allFieldsCompleted 
                      ? 'bg-brand-emerald text-white hover:bg-brand-emerald/90 cursor-pointer' 
                      : 'bg-[#e8ecf4] text-brand-emerald cursor-not-allowed opacity-60'
                  }`}
                >
                  Continue
                </button>
              </div>
            )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  if (!isMounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(modalTree, document.body);
}
