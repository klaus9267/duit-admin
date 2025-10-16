// API 타입 및 enum 정의

export enum EventType {
  CONFERENCE = "CONFERENCE",
  SEMINAR = "SEMINAR",
  WEBINAR = "WEBINAR",
  WORKSHOP = "WORKSHOP",
  CONTEST = "CONTEST",
  CONTINUING_EDUCATION = "CONTINUING_EDUCATION",
  EDUCATION = "EDUCATION",
  ETC = "ETC",
}

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  [EventType.CONFERENCE]: "컨퍼런스/학술대회",
  [EventType.SEMINAR]: "세미나",
  [EventType.WEBINAR]: "웨비나",
  [EventType.WORKSHOP]: "워크숍",
  [EventType.CONTEST]: "공모전",
  [EventType.CONTINUING_EDUCATION]: "보수교육",
  [EventType.EDUCATION]: "교육",
  [EventType.ETC]: "기타",
};

export enum PaginationField {
  ID = "ID",
  NAME = "NAME",
  START_DATE = "START_DATE",
  RECRUITMENT_DEADLINE = "RECRUITMENT_DEADLINE",
  VIEW_COUNT = "VIEW_COUNT",
  CREATED_AT = "CREATED_AT",
}

export enum SortDirection {
  ASC = "ASC",
  DESC = "DESC",
}

export interface HostResponse {
  id: number;
  name: string;
  thumbnail: string | null;
}

export interface EventResponse {
  id: number;
  title: string;
  startAt: string;
  endAt: string | null;
  recruitmentStartAt: string | null;
  recruitmentEndAt: string | null;
  uri: string;
  thumbnail: string | null;
  isApproved: boolean;
  eventType: EventType;
  host: HostResponse;
  viewCount: number;
  isBookmarked: boolean;
}

export interface PageInfo {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

export interface EventListResponse {
  content: EventResponse[];
  pageInfo: PageInfo;
}

export interface EventListParams {
  page?: number;
  size?: number;
  sortDirection?: SortDirection;
  field?: PaginationField;
  isApproved?: boolean;
  includeFinished?: boolean;
  isBookmarked?: boolean;
  type?: EventType[];
  hostId?: number;
  searchKeyword?: string;
}

export interface HostListResponse {
  content: HostResponse[];
  pageInfo: PageInfo;
}

export interface HostListParams {
  page?: number;
  size?: number;
  sortDirection?: SortDirection;
  field: PaginationField; // e.g., NAME
}
