import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        {/* More sections coming: HowItWorks, RealScores, Compare, Integration, SocialProof, FAQ */}
      </main>
      <Footer />
    </>
  );
}
