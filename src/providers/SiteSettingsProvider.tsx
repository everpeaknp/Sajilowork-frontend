'use client';

import { createContext, useContext } from 'react';

import type { SiteSettings } from '@/lib/siteSettings';
import { DEFAULT_SITE_NAME } from '@/lib/seo/constants';

const defaultSettings: SiteSettings = {
  site_name: DEFAULT_SITE_NAME,
  display_name: DEFAULT_SITE_NAME,
  site_domain: '',
  logo_url: null,
  favicon_url: null,
  meta_description: null,
  og_image_url: null,
  twitter_handle: null,
  contact_email: null,
  same_as: [],
};

const SiteSettingsContext = createContext<SiteSettings>(defaultSettings);

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettings {
  return useContext(SiteSettingsContext);
}
