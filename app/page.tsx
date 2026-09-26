import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import IntroSection from "@/components/home/IntroSection";
import ExpertiseSection from "@/components/home/ExpertiseSection";
import FinanceSection from "@/components/home/FinanceSection";
import TechnologySection from "@/components/home/TechnologySection";
import ComplianceSection from "@/components/home/ComplianceSection";
import LegalSection from "@/components/home/LegalSection";
import FourPillarTransition from "@/components/home/FourPillarTransition";
import OurBoardSection from "@/components/home/OurBoardSection";
import GlobalPresenceSection from "@/components/home/GlobalPresenceSection";
import StatsSection from "@/components/home/StatsSection";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main className="w-full min-h-screen">
      <Hero />
      <IntroSection />
      <ExpertiseSection />
      <FinanceSection />
      <TechnologySection />
      <ComplianceSection />
      <LegalSection />
      <FourPillarTransition />
      <OurBoardSection />
      <GlobalPresenceSection />
      <StatsSection />
      <Footer />
    </main>
  );
}
