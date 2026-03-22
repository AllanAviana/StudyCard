'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Summary = { id: string; title: string; content: string };
type Question = { id: string; statement: string; options: string[]; correctAnswer?: string; comment?: string };
type Topic = { id: string; name: string };
type Subject = { id: string; name: string; color: string };

export default function TopicView() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const topicId = params.topicId as string;
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [activeTab, setActiveTab] = useState<'summaries' | 'questions'>('summaries');
  
  const [loading, setLoading] = useState(true);

  // Form states for Summary
  const [sumTitle, setSumTitle] = useState('');
  const [sumContent, setSumContent] = useState('');

  // Form states for Question
  const [qStatement, setQStatement] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState('');
  const [qComment, setQComment] = useState('');
  
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    const [subRes, topRes, sumRes, qRes] = await Promise.all([
      fetch('/api/subjects'),
      fetch(`/api/topics?subjectId=${subjectId}`),
      fetch(`/api/summaries?topicId=${topicId}`),
      fetch(`/api/questions?topicId=${topicId}`)
    ]);

    if (subRes.ok && topRes.ok && sumRes.ok && qRes.ok) {
      const allSubjects = await subRes.json();
      const currentSub = allSubjects.find((s: any) => s.id === subjectId);
      
      const allTopics = await topRes.json();
      const currentTopic = allTopics.find((t: any) => t.id === topicId);
      
      setSubject(currentSub || null);
      setTopic(currentTopic || null);
      setSummaries(await sumRes.json());
      setQuestions(await qRes.json());
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [subjectId, topicId]);

  const handleCreateSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sumTitle || !sumContent) return;
    const res = await fetch('/api/summaries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: sumTitle, content: sumContent, topicId }),
    });
    if (res.ok) {
      setSumTitle(''); setSumContent('');
      loadData();
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qStatement) return;
    const validOptions = qOptions.filter(o => o.trim() !== '');
    if (validOptions.length < 2) return alert('Insira pelo menos 2 alternativas.');

    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statement: qStatement, options: validOptions, correctAnswer: qCorrect, comment: qComment, topicId }),
    });
    if (res.ok) {
      setQStatement(''); setQOptions(['', '', '', '']); setQCorrect(''); setQComment('');
      loadData();
    }
  };

  const handleDeleteSummary = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Excluir este resumo?')) return;
    await fetch(`/api/summaries/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Excluir esta questão?')) return;
    await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    loadData();
  };

  if (loading) return <div>Carregando conteúdo...</div>;
  if (!subject || !topic) return <div>Tópico não encontrado.</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1rem' }}>
        <Link href={`/dashboard/${subject.id}`} style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>
          &larr; Voltar para {subject.name}
        </Link>
      </div>
      
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', margin: 0, color: 'var(--primary)' }}>{topic.name}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Matéria: {subject.name}</p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--surface-border)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('summaries')}
          style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: activeTab === 'summaries' ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'summaries' ? '2px solid var(--primary)' : '2px solid transparent' }}
        >
          Resumos ({summaries.length})
        </button>
        <button 
          onClick={() => setActiveTab('questions')}
          style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: activeTab === 'questions' ? 'var(--primary)' : 'var(--text-secondary)', borderBottom: activeTab === 'questions' ? '2px solid var(--primary)' : '2px solid transparent' }}
        >
          Questões ({questions.length})
        </button>
      </div>

      {activeTab === 'summaries' && (
        <div className="animate-fade-in">
          <form onSubmit={handleCreateSummary} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Adicionar Resumo</h3>
            <input type="text" placeholder="Título do resumo..." value={sumTitle} onChange={e => setSumTitle(e.target.value)} required />
            <textarea placeholder="Conteúdo do resumo (escreva à vontade)..." value={sumContent} onChange={e => setSumContent(e.target.value)} rows={4} required></textarea>
            <div style={{ textAlign: 'right' }}>
              <button type="submit" className="btn-primary">Salvar Resumo</button>
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {summaries.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Sem resumos. Crie um!</p>}
            {summaries.map(summary => (
              <div key={summary.id} className="glass" style={{ padding: '0', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
                <div 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '1.5rem', backgroundColor: expandedSummary === summary.id ? 'var(--surface-border)' : 'transparent', transition: 'background-color 0.2s' }} 
                  onClick={() => setExpandedSummary(expandedSummary === summary.id ? null : summary.id)}
                >
                  <h3 style={{ margin: 0, color: 'var(--primary)' }}>{summary.title}</h3>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{expandedSummary === summary.id ? '▲ Ocultar' : '▼ Expandir'}</span>
                    <button onClick={(e) => handleDeleteSummary(summary.id, e)} style={{ color: 'var(--danger)', fontSize: '1.25rem', padding: '0 0.5rem' }} title="Excluir">&times;</button>
                  </div>
                </div>
                {expandedSummary === summary.id && (
                  <div className="animate-fade-in" style={{ padding: '1.5rem', borderTop: '1px solid var(--surface-border)', whiteSpace: 'pre-wrap', lineHeight: '1.6', background: 'var(--bg-color)', opacity: 0.9 }}>
                    {summary.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="animate-fade-in">
          <form onSubmit={handleCreateQuestion} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Adicionar Questão</h3>
            <textarea placeholder="Enunciado da questão..." value={qStatement} onChange={e => setQStatement(e.target.value)} rows={3} required></textarea>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {qOptions.map((opt, i) => (
                <input key={i} type="text" placeholder={`Alternativa ${String.fromCharCode(65 + i)}`} value={opt} onChange={e => { const newOpts = [...qOptions]; newOpts[i] = e.target.value; setQOptions(newOpts); }} />
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input type="text" placeholder="Gabarito correto (opcional)" value={qCorrect} onChange={e => setQCorrect(e.target.value)} />
              <input type="text" placeholder="Comentário sobre a resolução (opcional)" value={qComment} onChange={e => setQComment(e.target.value)} />
            </div>

            <div style={{ textAlign: 'right' }}>
              <button type="submit" className="btn-primary">Salvar Questão</button>
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {questions.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Nenhuma questão criada ainda.</p>}
            {questions.map((q, idx) => (
              <div key={q.id} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: '0 0 1rem 0', lineHeight: '1.5', fontSize: '1.125rem' }}>{idx + 1}. {q.statement}</h4>
                  <button onClick={() => handleDeleteQuestion(q.id)} style={{ color: 'var(--danger)', fontSize: '1.25rem', padding: '0 0.5rem' }} title="Excluir">&times;</button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {q.options.map((opt, i) => (
                    <div key={i} style={{ padding: '0.75rem 1rem', background: 'var(--surface-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', display: 'flex', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{String.fromCharCode(65 + i)})</span> {opt}
                    </div>
                  ))}
                </div>

                <div>
                  <button 
                    onClick={() => setRevealedAnswers(prev => ({...prev, [q.id]: !prev[q.id]}))}
                    className="btn-primary" style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    {revealedAnswers[q.id] ? 'Ocultar Gabarito' : 'Ver Gabarito'}
                  </button>
                </div>

                {revealedAnswers[q.id] && (
                  <div className="animate-fade-in" style={{ marginTop: '1rem', padding: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', borderLeft: '3px solid var(--success)', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                    <p style={{ margin: '0 0 0.5rem 0' }}><strong>Gabarito:</strong> {q.correctAnswer || <span style={{ color: 'var(--text-secondary)' }}>Não fornecido pelo autor.</span>}</p>
                    {q.comment && <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}><em>Comentário:</em> {q.comment}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
