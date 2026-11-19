import HeroSection from '@/components/HeroSection';
import MembersSection from '@/components/MembersSection';
import EventsSection from '@/components/EventsSection';
import GallerySection from '@/components/GallerySection';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <MembersSection />
      <EventsSection />
      <GallerySection />
    </main>
  );
}
