import Link from 'next/link';

export default function Home() {
  return (
    <main className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
      <div className="glass animate-fade-in" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>StudyCards</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
          O sistema definitivo para organizar seus estudos de forma visual e hierárquica. Crie matérias, tópicos, resumos e questões interativas.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/login" className="btn-primary">
            Acessar Conta
          </Link>
          <Link href="/register" className="btn-primary" style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--surface-border)' }}>
            Criar Conta
          </Link>
        </div>
      </div>
    </main>
  );
}
