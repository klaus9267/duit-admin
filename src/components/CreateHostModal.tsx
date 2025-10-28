import React, { useState } from 'react';
import { createHost } from '../api/hostsClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void; // 생성 후 목록 갱신용 콜백
}

export default function CreateHostModal({ isOpen, onClose, onCreated }: Props) {
  const [name, setName] = useState<string>('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('주최기관명을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }
      await createHost(formData);
      onCreated();
      onClose();
      setName('');
      setThumbnail(null);
    } catch (err: any) {
      alert(err?.message ?? '생성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          padding: '24px 28px',
          width: '90vw',
          maxWidth: 520,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>주최기관 생성</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>주최기관명 *</label>
              <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>로고 (선택)</label>
              <input type="file" accept="image/*" onChange={e => setThumbnail(e.target.files?.[0] ?? null)} className="input" style={{ width: '100%', boxSizing: 'border-box', lineHeight: '34px' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn" onClick={onClose} disabled={submitting}>
              취소
            </button>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? '생성 중...' : '생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
