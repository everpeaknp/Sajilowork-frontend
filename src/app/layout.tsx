import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/providers";
import MobileBottomNav from "@/components/common/MobileBottomNav";
import { buildSiteMetadata, fetchSiteSettings } from "@/lib/siteSettings";
import GlobalJsonLd from "@/components/seo/GlobalJsonLd";
import SentryInit from "@/components/SentryInit";
import { fontClassNames } from "@/lib/fonts";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  return buildSiteMetadata(settings);
}

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en-NP" className={`${fontClassNames} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <GlobalJsonLd />
        <AuthProvider>
          <SentryInit />
          {children}
          {modal}
          <MobileBottomNav />
          <Toaster position="bottom-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
