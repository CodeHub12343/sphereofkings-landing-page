import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Countdown from "@/components/Countdown";
import Features from "@/components/Features";
import Story from "@/components/Story";
import Showcase from "@/components/Showcase";
import Video from "@/components/Video";
import Tiers from "@/components/Tiers";
import FinalCTA from "@/components/FinalCTA";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Header />
      <Hero />
      <Countdown />
      <Features />
      <Story />
      <Showcase />
      <Video />
      <Tiers />
      <FinalCTA />
      <Contact />
      <Footer />
    </>
  );
}
