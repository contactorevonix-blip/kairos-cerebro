import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import ActivityFeed from '@/components/ActivityFeed';
import HowItWorks from '@/components/HowItWorks';
import Compare from '@/components/Compare';
import Integration from '@/components/Integration';
import SocialProof from '@/components/SocialProof';
import FAQ from '@/components/FAQ';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ActivityFeed />
        <HowItWorks />
        <Compare />
        <Integration />
        <SocialProof />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
