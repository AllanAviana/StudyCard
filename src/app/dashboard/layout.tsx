'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = 'auth-token=; Max-Age=0; path=/;';
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="glass" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
          <Link href="/dashboard" style={{ color: 'var(--primary)', letterSpacing: '-0.5px' }}>StudyCards</Link>
        </h1>
        <button onClick={handleLogout} style={{ color: 'var(--text-secondary)', fontWeight: 500, transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--danger)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
          Sair da Conta
        </button>
      </header>
      <main className="container" style={{ flex: 1, padding: '2rem 1rem' }}>
        {children}
      </main>
    </div>
  );
}
