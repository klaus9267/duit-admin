import React, { useState } from "react";
import { EventType } from "../api/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

interface FormData {
  title: string;
  startAt: string;
  endAt: string;
  recruitmentStartAt: string;
  recruitmentEndAt: string;
  uri: string;
  eventType: EventType;
  hostName: string;
  eventThumbnail?: File;
  hostThumbnail?: File;
}

const EVENT_TYPE_OPTIONS = [
  { value: EventType.CONFERENCE, label: "컨퍼런스/학술대회" },
  { value: EventType.SEMINAR, label: "세미나" },
  { value: EventType.WEBINAR, label: "웨비나" },
  { value: EventType.WORKSHOP, label: "워크숍" },
  { value: EventType.CONTEST, label: "공모전" },
  { value: EventType.CONTINUING_EDUCATION, label: "보수교육" },
  { value: EventType.EDUCATION, label: "교육" },
  { value: EventType.ETC, label: "기타" },
];

export default function CreateEventModal({ isOpen, onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    startAt: "",
    endAt: "",
    recruitmentStartAt: "",
    recruitmentEndAt: "",
    uri: "",
    eventType: EventType.CONFERENCE,
    hostName: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateDates = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 모집 시작일 < 모집 종료일
    if (formData.recruitmentStartAt && formData.recruitmentEndAt) {
      if (
        new Date(formData.recruitmentStartAt) >=
        new Date(formData.recruitmentEndAt)
      ) {
        newErrors.recruitmentEndAt =
          "모집 종료일은 모집 시작일보다 늦어야 합니다";
      }
    }

    // 행사 시작일 < 행사 종료일
    if (formData.startAt && formData.endAt) {
      if (new Date(formData.startAt) >= new Date(formData.endAt)) {
        newErrors.endAt = "행사 종료일은 행사 시작일보다 늦어야 합니다";
      }
    }

    // 모집 종료일 < 행사 시작일
    if (formData.recruitmentEndAt && formData.startAt) {
      if (new Date(formData.recruitmentEndAt) >= new Date(formData.startAt)) {
        newErrors.startAt = "행사 시작일은 모집 종료일보다 늦어야 합니다";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDates()) {
      return;
    }

    const submitData = new FormData();
    submitData.append(
      "data",
      JSON.stringify({
        title: formData.title,
        startAt: formData.startAt,
        endAt: formData.endAt,
        recruitmentStartAt: formData.recruitmentStartAt,
        recruitmentEndAt: formData.recruitmentEndAt,
        uri: formData.uri,
        eventType: formData.eventType,
        hostName: formData.hostName,
      })
    );

    if (formData.eventThumbnail) {
      submitData.append("eventThumbnail", formData.eventThumbnail);
    }
    if (formData.hostThumbnail) {
      submitData.append("hostThumbnail", formData.hostThumbnail);
    }

    onSubmit(submitData);
  };

  const handleInputChange = (field: keyof FormData, value: string | File) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 해당 필드의 에러 제거
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px 32px",
          width: "90vw",
          maxWidth: "900px",
          maxHeight: "85vh",
          overflow: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          margin: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
            행사 생성
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666",
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: "16px" }}>
            {/* 제목 */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                제목 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="input"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>

            {/* 행사 시작일/종료일 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div style={{ minWidth: "0" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  행사 시작일 *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startAt}
                  onChange={(e) => handleInputChange("startAt", e.target.value)}
                  className="input"
                  style={{
                    width: "100%",
                    minWidth: "200px",
                    boxSizing: "border-box",
                  }}
                  required
                />
                {errors.startAt && (
                  <div
                    style={{
                      color: "#dc2626",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    {errors.startAt}
                  </div>
                )}
              </div>
              <div style={{ minWidth: "0" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  행사 종료일 *
                </label>
                <input
                  type="datetime-local"
                  value={formData.endAt}
                  onChange={(e) => handleInputChange("endAt", e.target.value)}
                  className="input"
                  style={{
                    width: "100%",
                    minWidth: "200px",
                    boxSizing: "border-box",
                  }}
                  required
                />
                {errors.endAt && (
                  <div
                    style={{
                      color: "#dc2626",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    {errors.endAt}
                  </div>
                )}
              </div>
            </div>

            {/* 모집 시작일/종료일 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div style={{ minWidth: "0" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  모집 시작일
                </label>
                <input
                  type="datetime-local"
                  value={formData.recruitmentStartAt}
                  onChange={(e) =>
                    handleInputChange("recruitmentStartAt", e.target.value)
                  }
                  className="input"
                  style={{
                    width: "100%",
                    minWidth: "200px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ minWidth: "0" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  모집 종료일
                </label>
                <input
                  type="datetime-local"
                  value={formData.recruitmentEndAt}
                  onChange={(e) =>
                    handleInputChange("recruitmentEndAt", e.target.value)
                  }
                  className="input"
                  style={{
                    width: "100%",
                    minWidth: "200px",
                    boxSizing: "border-box",
                  }}
                />
                {errors.recruitmentEndAt && (
                  <div
                    style={{
                      color: "#dc2626",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    {errors.recruitmentEndAt}
                  </div>
                )}
              </div>
            </div>

            {/* 행사 URL */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                행사 URL *
              </label>
              <input
                type="url"
                value={formData.uri}
                onChange={(e) => handleInputChange("uri", e.target.value)}
                className="input"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                }}
                placeholder="https://example.com/event"
                required
              />
            </div>

            {/* 행사 유형 */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                행사 유형 *
              </label>
              <select
                value={formData.eventType}
                onChange={(e) =>
                  handleInputChange("eventType", e.target.value as EventType)
                }
                className="select"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                }}
                required
              >
                {EVENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 주최기관명 */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                주최기관명 *
              </label>
              <input
                type="text"
                value={formData.hostName}
                onChange={(e) => handleInputChange("hostName", e.target.value)}
                className="input"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>

            {/* 파일 업로드 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <div style={{ minWidth: "0" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  행사 썸네일
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleInputChange(
                      "eventThumbnail",
                      e.target.files?.[0] || new File([], "")
                    )
                  }
                  className="input"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    lineHeight: "34px",
                  }}
                />
              </div>
              <div style={{ minWidth: "0" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  주최기관 로고
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleInputChange(
                      "hostThumbnail",
                      e.target.files?.[0] || new File([], "")
                    )
                  }
                  className="input"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    lineHeight: "34px",
                  }}
                />
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              marginTop: "20px",
            }}
          >
            <button type="button" onClick={onClose} className="btn">
              취소
            </button>
            <button type="submit" className="btn primary">
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
