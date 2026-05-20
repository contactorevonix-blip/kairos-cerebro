import { Hero } from '@/components/landing/hero'
import { Stats } from '@/components/landing/stats'
import { Features } from '@/components/landing/features'
import { Pricing } from '@/components/landing/pricing'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <Pricing />
    </>
  )
}
