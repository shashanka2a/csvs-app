import HeroSection from '@/components/HeroSection'
import ArticlesEvents from '@/components/ArticlesEvents'
import GallerySection from '@/components/GallerySection'
import MatrimonySection from '@/components/MatrimonySection'
import MembersSection from '@/components/MembersSection'

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ArticlesEvents />
      <GallerySection />
      <MatrimonySection />
      <MembersSection />
    </main>
  )
}
