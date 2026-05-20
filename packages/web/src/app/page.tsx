// KairosCheck — Landing Page
// Em rebuild. Ver KAIROS/03-ENGENHARIA/specs/DESIGN_BRIEF_KAIROSCHECK.md
// @Uma define | @Dex implementa | @Quinn valida

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center"
          style={{ background: 'var(--kc-bg-base)' }}>
      <div className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tighter"
            style={{ color: 'var(--kc-text-primary)' }}>
          Kairos<span style={{ color: 'var(--kc-accent)' }}>Check</span>
        </h1>
        <p className="mt-4 text-lg" style={{ color: 'var(--kc-text-muted)' }}>
          Passo 3 — Design System em construção.
        </p>
      </div>
    </main>
  )
}
