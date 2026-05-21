import { Nav }      from '@/components/landing/nav'
import { Hero }     from '@/components/landing/hero'
import { Stats }    from '@/components/landing/stats'
import { Features } from '@/components/landing/features'
import { Pricing }  from '@/components/landing/pricing'
import { Footer }   from '@/components/landing/footer'

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </>
  )
}
