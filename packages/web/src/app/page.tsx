import { Hero }     from "@/components/sections/hero";
import Nav         from "@/components/Nav";
import Features    from "@/components/Features";
import LiveDemo    from "@/components/LiveDemo";
import Pricing     from "@/components/Pricing";
import ApiSection  from "@/components/ApiSection";
import FinalCTA    from "@/components/FinalCTA";
import Footer      from "@/components/Footer";
import ChatWidget  from "@/components/ChatWidget";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <LiveDemo />
        <ApiSection />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
