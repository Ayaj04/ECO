import Hero from "@/components/home/Hero";
import RKCAGlobalSection from "@/components/home/RKCAGlobalSection";
import IntroSection from "@/components/home/IntroSection";
import ExpertiseSection from "@/components/home/ExpertiseSection";
import FinanceSection from "@/components/home/FinanceSection";
import TechnologySection from "@/components/home/TechnologySection";
import ComplianceSection from "@/components/home/ComplianceSection";
import LegalSection from "@/components/home/LegalSection";
import FourPillarTransition from "@/components/home/FourPillarTransition";
import OurBoardSection from "@/components/home/OurBoardSection";
import StatsSection from "@/components/home/StatsSection";
import BrandStatementSection from "@/components/home/BrandStatementSection";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="w-full min-h-screen">
      <Hero />
      <RKCAGlobalSection />
      <IntroSection />
      <ExpertiseSection />
      <FinanceSection />
      <TechnologySection />
      <ComplianceSection />
      <LegalSection />
      <FourPillarTransition />
      <OurBoardSection />
      <StatsSection />
      <BrandStatementSection />
      <Footer />
    </main>
  );
}
