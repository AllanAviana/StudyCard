'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Topic = { id: string; name: string; _count?: { summaries: number, questions: number } };
type Subject = { id: string; name: string; color: string };

export default function SubjectView() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [subRes, topRes] = await Promise.all([
      fetch('/api/subjects'),
      fetch(`/api/topics?subjectId=${subjectId}`)
    ]);

    if (subRes.ok && topRes.ok) {
      const allSubjects = await subRes.json();
      const currentSub = allSubjects.find((s: any) => s.id === subjectId);
      if (!currentSub) {
        router.push('/dashboard');
        return;
      }
      setSubject(currentSub);
      setTopics(await topRes.json());
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [subjectId]);

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const res = await fetch('/api/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, subjectId }),
    });
    if (res.ok) {
      setName('');
      loadData();
    }
  };

  const handleDeleteTopic = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Excluir este tópico e todo o seu conteúdo (resumos e questões)?')) return;
    await fetch(`/api/topics/${id}`, { method: 'DELETE' });
    loadData();
  };

  if (loading) return <div>Carregando tópicos...</div>;
  if (!subject) return null;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>&larr; Voltar para as matérias</Link>
      </div>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', borderBottom: `4px solid ${subject.color}`, paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2rem', margin: 0 }}>{subject.name}</h1>
        
        <form onSubmit={handleCreateTopic} style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Novo tópico..." 
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '250px' }}
          />
          <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Adicionar</button>
        </form>
      </header>

      {topics.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)', background: 'var(--surface-color)', borderRadius: 'var(--radius-lg)' }}>
          <p>Nenhum tópico nesta matéria. Crie um acima para organizar os resumos e questões!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {topics.map(topic => (
            <Link href={`/dashboard/${subject.id}/${topic.id}`} key={topic.id} style={{ display: 'block' }}>
              <div 
                className="glass" 
                style={{ 
                  padding: '1.25rem 1.5rem', 
                  borderRadius: 'var(--radius-md)', 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background-color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--surface-border)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--surface-color)'}
              >
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--primary)' }}>{topic.name}</h3>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <span>{topic._count?.summaries || 0} resumos</span>
                    <span>{topic._count?.questions || 0} questões</span>
                  </div>
                </div>
                <div>
                  <button onClick={(e) => handleDeleteTopic(topic.id, e)} className="btn-primary" style={{ background: 'transparent', color: 'var(--danger)', padding: '0.5rem', border: '1px solid var(--danger)' }} title="Excluir Tópico">
                    Deletar
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
