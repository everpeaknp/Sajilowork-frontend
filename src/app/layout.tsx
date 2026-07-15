import type { Metadata } from "next";
import { AuthProvider, SiteSettingsProvider, ThemeProvider } from "@/providers";
import MobileBottomNav from "@/components/common/MobileBottomNav";
import ThemeAwareToaster from "@/components/common/ThemeAwareToaster";
import { buildSiteMetadata, fetchSiteSettings } from "@/lib/siteSettings";
import GlobalJsonLd from "@/components/seo/GlobalJsonLd";
import SentryInit from "@/components/SentryInit";
import { fontClassNames } from "@/lib/fonts";
import "./globals.css";

const themeInitScript = `(function(){try{var k='sw-theme';var t=localStorage.getItem(k);var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';r.dataset.theme=d?'dark':'light';}catch(e){}})();`;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  return buildSiteMetadata(settings);
}

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const siteSettings = await fetchSiteSettings();

  return (
    <html lang="en-NP" className={`${fontClassNames} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <GlobalJsonLd />
        <ThemeProvider>
          <AuthProvider>
            <SiteSettingsProvider settings={siteSettings}>
              <SentryInit />
              {children}
              {modal}
              <MobileBottomNav />
              <ThemeAwareToaster />
            </SiteSettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
