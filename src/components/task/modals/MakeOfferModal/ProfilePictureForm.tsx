"use client";

import { ChevronLeft, User, Plus } from 'lucide-react';
import { User as UserType } from '@/types';

interface ProfilePictureFormProps {
  user: UserType | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isLoading: boolean;
  onBack: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfilePictureForm({
  user,
  fileInputRef,
  isLoading,
  onBack,
  onFileChange
}: ProfilePictureFormProps) {
  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-brand-emerald font-bold mb-6 hover:underline"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>

      <h3 className="text-2xl font-bold text-brand-dark mb-6">Profile picture</h3>

      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          {user?.profile_image ? (
            <img
              src={user.profile_image}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-surface-dim"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-surface-dim flex items-center justify-center border-4 border-outline-variant">
              <User className="w-16 h-16 text-on-surface-variant" />
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="absolute bottom-0 right-0 w-10 h-10 bg-brand-emerald text-white rounded-full flex items-center justify-center hover:bg-brand-emerald/90 transition-all disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={onFileChange}
          className="hidden"
        />

        <p className="text-sm text-on-surface-variant text-center">
          Upload a clear photo of yourself
          <br />
          <span className="text-xs">Max 5MB • JPG, PNG, GIF, WebP</span>
        </p>
      </div>

      {isLoading && (
        <div className="text-center text-brand-emerald font-semibold">
          Uploading...
        </div>
      )}
    </>
  );
}
