import { ThemeJourney } from "@/components/landing/theme-journey";

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
        <LandingFeatures />
        <LandingNumbers />
        <ThemeJourney />
        <LandingWorkflow />
        <LandingFaq />
        <LandingCta />
      </main>
    </div>
  );
}
