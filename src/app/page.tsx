import "@/components/LangingHome/landing-home.css";
import Navbar from "@/components/common/navbar";
import Hero from "@/components/LangingHome/hero";
import ServiceFeatures from "@/components/LangingHome/ServiceFeatures";
import TaskFeed from "@/components/LangingHome/TaskFeed";
import TrustSecurity from "@/components/LangingHome/TrustSecurity";
import EarningsBanner from "@/components/LangingHome/EarningsBanner";
import BlogSection from "@/components/LangingHome/BlogSection";
import CategoryDirectory from "@/components/LangingHome/CategoryDirectory";
import Footer from "@/components/common/footer";
import HomeAuthRedirect from "@/app/_components/HomeAuthRedirect";

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-[#1161fe] selection:text-white font-body">
      <HomeAuthRedirect />
      <Navbar />
      <main>
        <Hero />
        <ServiceFeatures />
        <TaskFeed />
        <TrustSecurity />
        <EarningsBanner />
        <BlogSection />
        <CategoryDirectory />
      </main>
      <Footer />
    </div>
  );
}
