import { Nav } from '@/components/landing/nav'
import { Footer } from '@/components/landing/footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Nav />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  )
}
