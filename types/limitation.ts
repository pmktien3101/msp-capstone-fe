export interface Limitation {
  id: string;
  name: string;
  description?: string;
  isUnlimited?: boolean;
  limitValue?: number;
  limitUnit?: string;
  createdAt?: string;
  updatedAt?: string;
  limitationType?: string;
}
export interface LimitationUsage {
  id: string;
  name: string;
  description?: string;
  isUnlimited?: boolean;
  limitValue?: number;
  limitUnit?: string;
  limitationType?: string;
  createdAt?: string;
  updatedAt?: string;
  usedValue?: number;
}
// Matches MSP.Application.Models.Requests.Limitation.CreateLimitationRequest
export interface CreateLimitationRequest {
  name: string;
  description?: string;
  isUnlimited: boolean;
  limitValue: number;
  limitUnit: string;
  limitationType: string;
}

// Matches MSP.Application.Models.Requests.Limitation.UpdateLimitationRequest
export interface UpdateLimitationRequest {
  limitationId: string; // Guid as string
  name: string;
  description?: string;
  isUnlimited: boolean;
  limitValue: number;
  limitUnit: string;
  limitationType: string;
}

export interface PagingRequest {
  pageIndex?: number;
  pageSize?: number;
}

export interface PagingResponse<T> {
  items: T[];
  totalItems: number;
  pageIndex: number;
  pageSize: number;
}
