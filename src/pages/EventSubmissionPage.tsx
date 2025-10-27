import React, { useState, useEffect } from 'react';
import { EventType, HostResponse } from '../api/types';
import { submitEvent } from '../api/submissionClient';
import { getAllHosts } from '../api/hostsClient';

interface SubmissionFormData {
  // 행사 기본 정보
  title: string;
  startAt: string;
  endAt: string;
  recruitmentStartAt: string;
  recruitmentEndAt: string;
  uri: string;
  eventType: EventType;

  // 주최기관 정보
  hostMode: 'select' | 'create'; // 주최기관 선택 방식
  hostId: number; // 기존 주최기관 선택 시
  hostName: string; // 새 주최기관 생성 시

  // 파일
  eventThumbnail?: File;
  hostThumbnail?: File;
}

const EVENT_TYPE_OPTIONS = [
  { value: EventType.CONFERENCE, label: '컨퍼런스/학술대회' },
  { value: EventType.SEMINAR, label: '세미나' },
  { value: EventType.WEBINAR, label: '웨비나' },
  { value: EventType.WORKSHOP, label: '워크숍' },
  { value: EventType.CONTEST, label: '공모전' },
  { value: EventType.CONTINUING_EDUCATION, label: '보수교육' },
  { value: EventType.EDUCATION, label: '교육' },
  { value: EventType.ETC, label: '기타' },
];

export default function EventSubmissionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hosts, setHosts] = useState<HostResponse[]>([]);
  const [loadingHosts, setLoadingHosts] = useState<boolean>(false);

  const [formData, setFormData] = useState<SubmissionFormData>({
    title: '',
    startAt: '',
    endAt: '',
    recruitmentStartAt: '',
    recruitmentEndAt: '',
    uri: '',
    eventType: EventType.CONFERENCE,
    hostMode: 'select',
    hostId: 0,
    hostName: '',
  });

  // 주최기관 목록 로드
  useEffect(() => {
    const loadHosts = async () => {
      setLoadingHosts(true);
      try {
        const hostList = await getAllHosts();
        setHosts(hostList);
      } catch (error) {
        console.error('주최기관 목록 로드 실패:', error);
        alert('주최기관 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoadingHosts(false);
      }
    };

    loadHosts();
  }, []);

  const handleInputChange = (field: keyof SubmissionFormData, value: string | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 행사 기본 정보 검증
    if (!formData.title.trim()) newErrors.title = '행사 제목을 입력해주세요';
    if (!formData.startAt) newErrors.startAt = '행사 시작일을 선택해주세요';
    if (!formData.endAt) newErrors.endAt = '행사 종료일을 선택해주세요';
    if (!formData.uri.trim()) newErrors.uri = '행사 URL을 입력해주세요';

    // 주최기관 검증
    if (formData.hostMode === 'select') {
      if (formData.hostId === 0) newErrors.hostId = '주최기관을 선택해주세요';
    } else {
      if (!formData.hostName.trim()) newErrors.hostName = '주최기관명을 입력해주세요';
    }

    // 날짜 유효성 검사
    if (formData.startAt && formData.endAt) {
      if (new Date(formData.startAt) >= new Date(formData.endAt)) {
        newErrors.endAt = '행사 종료일은 시작일보다 늦어야 합니다';
      }
    }

    if (formData.recruitmentStartAt && formData.recruitmentEndAt) {
      if (new Date(formData.recruitmentStartAt) >= new Date(formData.recruitmentEndAt)) {
        newErrors.recruitmentEndAt = '모집 종료일은 모집 시작일보다 늦어야 합니다';
      }
    }

    if (formData.recruitmentEndAt && formData.startAt) {
      if (new Date(formData.recruitmentEndAt) >= new Date(formData.startAt)) {
        newErrors.startAt = '행사 시작일은 모집 종료일보다 늦어야 합니다';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // FormData 생성
      const submitData = new FormData();

      // JSON 데이터를 "data" 키로 추가
      submitData.append(
        'data',
        JSON.stringify({
          title: formData.title,
          startAt: formData.startAt,
          endAt: formData.endAt,
          recruitmentStartAt: formData.recruitmentStartAt || null,
          recruitmentEndAt: formData.recruitmentEndAt || null,
          uri: formData.uri,
          eventType: formData.eventType,
          ...(formData.hostMode === 'select' ? { hostId: formData.hostId } : { hostName: formData.hostName }),
        })
      );

      // 파일이 실제로 선택되었을 때만 추가
      if (formData.eventThumbnail && formData.eventThumbnail.size > 0) {
        submitData.append('eventThumbnail', formData.eventThumbnail);
      }
      // 새 주최기관 생성 시에만 주최기관 로고 업로드 가능
      if (formData.hostMode === 'create' && formData.hostThumbnail && formData.hostThumbnail.size > 0) {
        submitData.append('hostThumbnail', formData.hostThumbnail);
      }

      // API 호출
      const result = await submitEvent(submitData);
      console.log('제보 성공:', result);

      setIsSubmitted(true);
    } catch (error: any) {
      console.error('제보 실패:', error);
      alert(`제보 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      startAt: '',
      endAt: '',
      recruitmentStartAt: '',
      recruitmentEndAt: '',
      uri: '',
      eventType: EventType.CONFERENCE,
      hostMode: 'select',
      hostId: 0,
      hostName: '',
    });
    setIsSubmitted(false);
    setErrors({});
  };

  if (isSubmitted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '32px',
              color: 'white',
            }}
          >
            ✓
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 16px 0',
            }}
          >
            제보가 완료되었습니다!
          </h2>
          <p
            style={{
              color: '#6b7280',
              fontSize: '16px',
              lineHeight: '1.6',
              margin: '0 0 32px 0',
            }}
          >
            소중한 행사 정보를 공유해주셔서 감사합니다.
            <br />
            검토 후 승인되면 공개됩니다.
          </p>
          <button
            onClick={resetForm}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            다른 행사 제보하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >
          <h1
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: 'white',
              margin: '0 0 8px 0',
            }}
          >
            Du it! 행사 제보
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0',
            }}
          >
            여러분의 소중한 행사 정보를 공유해주세요
          </p>
        </div>

        {/* 폼 컨테이너 */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}
        >
          <form onSubmit={handleSubmit}>
            <div>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 24px 0',
                }}
              >
                행사 정보
              </h3>

              <div style={{ display: 'grid', gap: '20px' }}>
                {/* 행사 제목 */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#374151',
                    }}
                  >
                    행사 제목 *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => handleInputChange('title', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                    }}
                    placeholder="행사 제목을 입력해주세요"
                  />
                  {errors.title && <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>{errors.title}</div>}
                </div>

                {/* 행사 기간 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#374151',
                      }}
                    >
                      행사 시작일 *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startAt}
                      onChange={e => handleInputChange('startAt', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.startAt && <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>{errors.startAt}</div>}
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#374151',
                      }}
                    >
                      행사 종료일 *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endAt}
                      onChange={e => handleInputChange('endAt', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.endAt && <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>{errors.endAt}</div>}
                  </div>
                </div>

                {/* 모집 기간 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#374151',
                      }}
                    >
                      모집 시작일
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.recruitmentStartAt}
                      onChange={e => handleInputChange('recruitmentStartAt', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        color: '#374151',
                      }}
                    >
                      모집 종료일
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.recruitmentEndAt}
                      onChange={e => handleInputChange('recruitmentEndAt', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                      }}
                    />
                    {errors.recruitmentEndAt && <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>{errors.recruitmentEndAt}</div>}
                  </div>
                </div>

                {/* 행사 URL */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#374151',
                    }}
                  >
                    행사 URL *
                  </label>
                  <input
                    type="url"
                    value={formData.uri}
                    onChange={e => handleInputChange('uri', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                    }}
                    placeholder="https://example.com/event"
                  />
                  {errors.uri && <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>{errors.uri}</div>}
                </div>

                {/* 행사 유형 */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#374151',
                    }}
                  >
                    행사 유형 *
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={e => handleInputChange('eventType', e.target.value as EventType)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                    }}
                  >
                    {EVENT_TYPE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 주최기관 선택 */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '500',
                      color: '#374151',
                    }}
                  >
                    주최기관 *
                  </label>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input type="radio" name="hostMode" value="select" checked={formData.hostMode === 'select'} onChange={e => handleInputChange('hostMode', e.target.value)} />
                      기존 주최기관 선택
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input type="radio" name="hostMode" value="create" checked={formData.hostMode === 'create'} onChange={e => handleInputChange('hostMode', e.target.value)} />새 주최기관 생성
                    </label>
                  </div>

                  {/* 기존 주최기관 선택 */}
                  {formData.hostMode === 'select' && (
                    <select
                      value={formData.hostId}
                      onChange={e => handleInputChange('hostId', Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                      }}
                      disabled={loadingHosts}
                    >
                      <option value={0}>{loadingHosts ? '로딩 중...' : '주최기관을 선택하세요'}</option>
                      {hosts.map(host => (
                        <option key={host.id} value={host.id}>
                          {host.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* 새 주최기관 생성 */}
                  {formData.hostMode === 'create' && (
                    <input
                      type="text"
                      value={formData.hostName}
                      onChange={e => handleInputChange('hostName', e.target.value)}
                      placeholder="새 주최기관명을 입력하세요"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                      }}
                    />
                  )}

                  {errors.hostId && <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>{errors.hostId}</div>}
                  {errors.hostName && <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>{errors.hostName}</div>}
                </div>

                {/* 파일 업로드 섹션 */}
                <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '20px', marginTop: '20px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' }}>파일 업로드 (선택사항)</h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* 행사 썸네일 */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '500',
                          color: '#374151',
                        }}
                      >
                        행사 썸네일
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleInputChange('eventThumbnail', e.target.files?.[0] || new File([], ''))}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '16px',
                          boxSizing: 'border-box',
                        }}
                      />
                      <p
                        style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '8px 0 0 0',
                        }}
                      ></p>
                    </div>

                    {/* 새 주최기관 생성 시에만 주최기관 로고 업로드 표시 */}
                    {formData.hostMode === 'create' && (
                      <div>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '500',
                            color: '#374151',
                          }}
                        >
                          주최기관 로고
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleInputChange('hostThumbnail', e.target.files?.[0] || new File([], ''))}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '16px',
                            boxSizing: 'border-box',
                          }}
                        />
                        <p
                          style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            margin: '8px 0 0 0',
                          }}
                        >
                          JPG, PNG, GIF 파일만 업로드 가능합니다 (최대 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '32px',
              }}
            >
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '16px 32px',
                  border: 'none',
                  borderRadius: '8px',
                  background: isSubmitting ? '#9ca3af' : 'var(--primary)',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  minWidth: '200px',
                }}
              >
                {isSubmitting ? '제보 중...' : '행사 제보하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
