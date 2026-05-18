import Nav       from "@/components/Nav";
import Hero      from "@/components/Hero";
import Features  from "@/components/Features";
import LiveDemo  from "@/components/LiveDemo";
import ApiSection from "@/components/ApiSection";
import Pricing   from "@/components/Pricing";
import FinalCTA  from "@/components/FinalCTA";
import Footer    from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Nav />
      <Hero />
      <Features />
      <LiveDemo />
      <ApiSection />
      <Pricing />
      <FinalCTA />
      <Footer />
      <ChatWidget />
    </main>
  );
}
