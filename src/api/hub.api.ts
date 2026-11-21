import apiClient from "@/lib/apiClient";

export interface IHub {
  id: string;
  name: string;
  code: string;
  address: string;
  zone: string;
  contactNo?: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IHubMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface IHubsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IHub[];
  meta?: IHubMeta;
}

export interface IHubResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IHub;
}

export interface IGetHubsParams {
  search?: string;
  searchTerm?: string;
  zone?: string;
  page?: number;
  limit?: number;
}

export interface ICreateHubPayload {
  name: string;
  code?: string;
  address: string;
  zone: string;
  contactNo?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface IUpdateHubPayload {
  name?: string;
  code?: string;
  address?: string;
  zone?: string;
  contactNo?: string;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * GET /api/v1/hubs
 * Fetches all hubs with optional query parameters (search, zone, page, limit)
 */
export function getAllHubs(params?: IGetHubsParams): Promise<IHubsResponse> {
  const p = { limit: 100, ...params };
  const sp = new URLSearchParams();
  const query = p.search || p.searchTerm;
  if (query) {
    sp.set("search", query);
    sp.set("searchTerm", query);
  }
  if (p.zone && p.zone !== "ALL" && p.zone !== "All") {
    sp.set("zone", p.zone);
  }
  if (p.page) sp.set("page", String(p.page));
  sp.set("limit", String(p.limit ?? 100));

  const qs = sp.toString();
  const queryString = qs ? `?${qs}` : "";

  return apiClient<IHubsResponse>(`/hubs${queryString}`, {
    method: "GET",
  });
}

/**
 * GET /api/v1/hubs/:id
 * Fetches single hub details by ID
 */
export function getHubById(id: string): Promise<IHubResponse> {
  return apiClient<IHubResponse>(`/hubs/${id}`, {
    method: "GET",
  });
}

/**
 * POST /api/v1/hubs/create
 * Creates a new hub
 */
export function createHub(payload: ICreateHubPayload): Promise<IHubResponse> {
  return apiClient<IHubResponse>("/hubs/create", {
    method: "POST",
    body: payload,
  });
}

/**
 * PATCH /api/v1/hubs/:id
 * Updates an existing hub by ID
 */
export function updateHub(
  id: string,
  payload: IUpdateHubPayload,
): Promise<IHubResponse> {
  return apiClient<IHubResponse>(`/hubs/${id}`, {
    method: "PATCH",
    body: payload,
  });
}
