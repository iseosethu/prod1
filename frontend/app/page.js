import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ServiceCards from '../components/ServiceCards';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      <Navbar />
      <HeroSection />
      <ServiceCards />
      <Footer />
    </main>
  );
}