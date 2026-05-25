import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { Trust } from "@/components/landing/Trust";
import { Features } from "@/components/landing/Features";
import { Directory } from "@/components/landing/Directory";
import { ContactUs } from "@/components/landing/ContactUs";
import { HelpRequest } from "@/components/landing/HelpRequest";
import { RegisterAssociation } from "@/components/landing/RegisterAssociation";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { LiveImpact } from "@/components/landing/LiveImpact";
import { Categories } from "@/components/landing/Categories";
import { LatestNews } from "@/components/landing/LatestNews";
import { FAQ } from "@/components/landing/FAQ";
import { ChatBot } from "@/components/ChatBot";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />
      <main className="flex-1">
        <Hero />
        <LiveImpact />
        <Trust />
        <Features />
        <Categories />
        <ContactUs />
        <Directory />
        <LatestNews />
        <HelpRequest />
        <RegisterAssociation />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
}
