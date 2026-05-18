import Nav from '@/components/landing/nav';
import Hero from '@/components/landing/hero';
import LiveDemo from '@/components/landing/live-demo';
import HowItWorks from '@/components/landing/how-it-works';
import SdkSection from '@/components/landing/sdk-section';
import Features from '@/components/landing/features';
import InteractiveDemo from '@/components/landing/interactive-demo';
import SocialProof from '@/components/landing/social-proof';
import Pricing from '@/components/landing/pricing';
import CtaFinal from '@/components/landing/cta-final';
import Footer from '@/components/landing/footer';
import Chatbot from '@/components/landing/chatbot';

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>

        <div style={{
          background: `
            radial-gradient(ellipse 900px 500px at 50% -5%, rgba(0,220,130,0.12) 0%, transparent 65%),
            radial-gradient(ellipse 400px 300px at 80% 20%, rgba(0,220,130,0.04) 0%, transparent 60%),
            #000
          `,
        }}>
          <Hero />
        </div>

        {/* LIVE DEMO */}
        <LiveDemo />

        <div style={{ background: `radial-gradient(ellipse 600px 400px at 50% 100%, rgba(0,220,130,0.05), transparent 70%), #000` }}>
          <HowItWorks />
        </div>

        <SdkSection />
        <Features />
        <InteractiveDemo />

        <div style={{
          borderTop: '1px solid',
          borderImage: 'linear-gradient(to right, transparent, #1f1f1f 20%, #1f1f1f 80%, transparent) 1',
          background: '#000',
        }}>
          <SocialProof />
        </div>

        <div style={{
          background: `radial-gradient(ellipse 800px 600px at 50% 50%, rgba(0,220,130,0.05), transparent 70%), #000`,
          borderTop: '1px solid #1a1a1a',
        }}>
          <Pricing />
        </div>

        <CtaFinal />

      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
