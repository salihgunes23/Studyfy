import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { Cta } from '@/components/sections/cta';
import { Faq } from '@/components/sections/faq';
import { Features } from '@/components/sections/features';
import { Hero } from '@/components/sections/hero';
import { HowItWorks } from '@/components/sections/how-it-works';
import { LayersSection } from '@/components/sections/layers';
import { TestEngine } from '@/components/sections/test-engine';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <LayersSection />
        <TestEngine />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
