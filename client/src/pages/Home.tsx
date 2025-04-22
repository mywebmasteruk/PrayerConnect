import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PrayerForm from "@/components/PrayerForm";
import PrayerFeed from "@/components/PrayerFeed";
import AboutSection from "@/components/AboutSection";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <PrayerForm />
        <PrayerFeed />
        <AboutSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
