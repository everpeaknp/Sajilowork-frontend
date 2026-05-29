'use client';

import '@/components/LangingHome/landing-home.css';
import { useRouter } from 'next/navigation';
import Hero from '@/components/discover/Hero';
import CategoryCarousel from '@/components/discover/CategoryCarousel';
import GridCategories from '@/components/discover/GridCategories';
import BottomCTA from '@/components/discover/BottomCTA';
import Navbar from '@/components/common/navbar';
import Footer from '@/components/common/footer';

export default function DiscoverPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white selection:bg-[#1161fe] selection:text-white font-body">
      <Navbar />
      <main>
        <Hero
          onPostWithTitle={(title) => {
            router.push(`/post-task?title=${encodeURIComponent(title)}`);
          }}
        />
        <CategoryCarousel
          onSelectCategory={(categoryName) => {
            router.push(`/post-task?title=${encodeURIComponent(categoryName)}`);
          }}
        />
        <GridCategories
          onSelectGridCategory={(name) => {
            router.push(`/post-task?title=${encodeURIComponent(name)}`);
          }}
        />
        <BottomCTA
          onPostClick={() => {
            router.push('/post-task');
          }}
        />
      </main>
      <Footer />
    </div>
  );
}