import { ThemeJourney } from "@/components/landing/theme-journey";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingPreview } from "@/components/landing/landing-preview";
import {
  LandingFeatures,
  LandingNumbers,
  LandingWorkflow,
  LandingFaq,
  LandingCta,
} from "@/components/landing/landing-sections";

export default function App() {
  return (
    <div className="overflow-x-clip">
      <main id="main">
        <LandingHero />
        <LandingPreview />
        <ScrollReveal>
          <LandingFeatures />
        </ScrollReveal>
        <LandingNumbers />
        <ThemeJourney />
        <LandingWorkflow />
        <ScrollReveal>
          <LandingFaq />
        </ScrollReveal>
        <ScrollReveal>
          <LandingCta />
        </ScrollReveal>
      </main>
    </div>
  );
}
