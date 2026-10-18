import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DonateSection from "@/components/DonateSection";

export const metadata = {
  title: "Support the project — Sphere of Kings",
};

export default function DonatePage() {
  return (
    <>
      <Header />
      <main>
        <DonateSection titleTag="h1" />
      </main>
      <Footer />
    </>
  );
}
