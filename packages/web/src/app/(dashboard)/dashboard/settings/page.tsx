export default function SettingsPage() {
  return (
    <div>
      <h1 style={{ color: 'var(--kc-text-primary)', fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>
        Definições
      </h1>
      <div style={{
        background: 'var(--kc-bg-surface)', border: '1px solid var(--kc-border-subtle)',
        borderRadius: '12px', padding: '32px', color: 'var(--kc-text-muted)', fontSize: '14px',
        textAlign: 'center',
      }}>
        Em breve: plano, faturação, webhooks, configurações da conta.
      </div>
    </div>
  )
}
