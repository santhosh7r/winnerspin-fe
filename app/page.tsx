
import { Hero } from "@/components/landing/hero";
import { WhyChoose } from "@/components/landing/why-choose";
import { Testimonials } from "@/components/landing/testimonials";
import { Founder } from "@/components/landing/founder";
import { CTA } from "@/components/landing/cta";
import { FAQ } from "@/components/landing/faq";
import { FashionBrand } from "@/components/landing/fashion-brand";
import { Footer } from "@/components/landing/footer";
import MyJourneyPage from "@/components/landing/timeline";
import NavBar from "@/components/landing/navbar";
import { OurAppliances } from "@/components/landing/OurAppliances";
import { AboutUs } from "@/components/landing/aboutUs";

export default function Home() {
  return (
    <main className="min-h-screen bg-black overflow-hidden">
      <NavBar />
      <Hero />
      <AboutUs />
      {/* <HowItWorks /> */}
      <MyJourneyPage />
      <WhyChoose />
      <OurAppliances />
      <Testimonials />
      <Founder />
      <CTA />
      <FAQ />
      <FashionBrand />
      <Footer />
    </main>
  );
}
