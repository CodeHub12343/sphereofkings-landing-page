import Header from "@/components/Header";
import Hero from "@/components/Hero";
import KingdomCollection from "@/components/KingdomCollection";
// ChristmasPanel removed on client request (James, 2026-10-29) —
// all sales are routed through Kickstarter until further notice.
import Features from "@/components/Features";
import Story from "@/components/Story";
import Showcase from "@/components/Showcase";
import Video from "@/components/Video";
import BecomeKingdom from "@/components/BecomeKingdom";
import SponsorshipBand from "@/components/SponsorshipBand";
import Tiers from "@/components/Tiers";
import Countdown from "@/components/Countdown";
import DonateSection from "@/components/DonateSection";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import GiveawayBand from "@/components/GiveawayBand";
// import PlayGamesBand from "@/components/PlayGamesBand"; // temporarily hidden per owner request

// Section order (commerce-forward):
// Hero → Collection → Early Bird promo → Features & Story → Seven-in-one
// Showcase → Video → Join the Kingdom (affiliate/wholesale/donate) →
// Kickstarter chapter + signup → Countdown → Contact.
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <Hero />
      <GiveawayBand />
      {/* <PlayGamesBand /> — temporarily hidden per owner request */}
      <KingdomCollection />
      {/* ChristmasPanel removed — Kickstarter-only mode (James, 2026-10-29) */}
      <Features />
      <Story />
      <Showcase />
      <Video />
      <BecomeKingdom />
      <SponsorshipBand />
      <Tiers />
      <Countdown />
      <DonateSection />
      <Contact />
      <Footer />
    </>
  );
}
