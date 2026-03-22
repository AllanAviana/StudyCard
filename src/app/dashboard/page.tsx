'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Subject = { id: string; name: string; color: string; _count?: { topics: number } };

export default function Dashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');

  const loadSubjects = async () => {
    const res = await fetch('/api/subjects');
    if (res.ok) {
      setSubjects(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => { loadSubjects(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const res = await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });
    if (res.ok) {
      setName('');
      loadSubjects();
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Excluir esta matéria e todos os seus tópicos?')) return;
    await fetch(`/api/subjects/${id}`, { method: 'DELETE' });
    loadSubjects();
  };

  if (loading) return <div>Carregando matérias...</div>;

  return (
    <div className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Minhas Matérias</h1>
        
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-color)', padding: '0.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <input 
            type="color" 
            value={color} 
            onChange={e => setColor(e.target.value)} 
            style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }} 
            title="Cor da Matéria"
          />
          <input 
            type="text" 
            placeholder="Nova matéria..." 
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '200px' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Criar</button>
        </form>
      </header>

      {subjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)', background: 'var(--surface-color)', borderRadius: 'var(--radius-lg)' }}>
          <p>Nenhuma matéria criada ainda. Comece adicionando uma acima!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {subjects.map(sub => (
            <Link href={`/dashboard/${sub.id}`} key={sub.id} style={{ display: 'block' }}>
              <div 
                className="glass" 
                style={{ 
                  padding: '1.5rem', 
                  borderRadius: 'var(--radius-lg)', 
                  borderTop: `4px solid ${sub.color}`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  height: '100%',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-glass)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{sub.name}</h3>
                  <button onClick={(e) => handleDelete(sub.id, e)} style={{ color: 'var(--text-secondary)', padding: '0.25rem', fontSize: '1.25rem', lineHeight: 1 }} title="Excluir Matéria">
                    &times;
                  </button>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {sub._count?.topics || 0} {sub._count?.topics === 1 ? 'tópico' : 'tópicos'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
