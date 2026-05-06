import { env } from "@/app/config/env";
import { request } from "@/shared/api/http-client";
import type {
  SaveTripJournalPayload,
  TripJournalAssetListResult,
  TripJournalAssetResult,
  TripJournalResult,
  UpdateTripJournalPayload,
} from "@/features/journal/types/journal";

type RequestOptions = {
  signal?: AbortSignal;
};

export async function getTripJournal(
  tripId: string,
  options: RequestOptions = {},
) {
  return request<TripJournalResult>(`/trips/${tripId}/journal`, {
    auth: true,
    signal: options.signal,
  });
}

export async function getPublicTripJournal(
  tripId: string,
  options: RequestOptions = {},
) {
  return request<TripJournalResult>(`/public/trips/${tripId}/journal`, {
    signal: options.signal,
  });
}

export async function listMyJournals(options: RequestOptions = {}) {
  return request<TripJournalResult[]>("/journals/mine", {
    auth: true,
    signal: options.signal,
  });
}

export async function listPublicJournals(options: RequestOptions = {}) {
  return request<TripJournalResult[]>("/public/journals", {
    signal: options.signal,
  });
}

export async function saveTripJournal(
  tripId: string,
  payload: SaveTripJournalPayload,
) {
  return request<TripJournalResult, SaveTripJournalPayload>(
    `/trips/${tripId}/journal`,
    {
      method: "PUT",
      auth: true,
      body: payload,
    },
  );
}

export async function uploadTripJournalAsset(tripId: string, file: File) {
  const formData = new FormData();

  formData.set("file", file);

  const result = await request<TripJournalAssetResult, FormData>(
    `/trips/${tripId}/journal/assets`,
    {
      method: "POST",
      auth: true,
      body: formData,
    },
  );

  return {
    asset: {
      ...result.asset,
      url: resolveJournalAssetUrl(result.asset.url),
    },
  };
}

export async function listTripJournalAssets(
  tripId: string,
  options: RequestOptions = {},
) {
  const result = await request<TripJournalAssetListResult>(
    `/trips/${tripId}/journal/assets`,
    {
      auth: true,
      signal: options.signal,
    },
  );

  return {
    assets: result.assets.map((asset) => ({
      ...asset,
      url: resolveJournalAssetUrl(asset.url),
    })),
  };
}

export async function deleteTripJournalAsset(tripId: string, assetId: string) {
  return request<void>(`/trips/${tripId}/journal/assets/${assetId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function resolveJournalAssetUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/")
    ? pathOrUrl.slice(1)
    : pathOrUrl;
  const normalizedBaseUrl = env.apiBaseUrl.endsWith("/")
    ? env.apiBaseUrl
    : `${env.apiBaseUrl}/`;

  return new URL(normalizedPath, normalizedBaseUrl).toString();
}

export async function updateTripJournalVisibility(
  tripId: string,
  payload: UpdateTripJournalPayload,
) {
  return request<TripJournalResult, UpdateTripJournalPayload>(
    `/trips/${tripId}/journal`,
    {
      method: "PATCH",
      auth: true,
      body: payload,
    },
  );
}

export async function deleteTripJournal(tripId: string) {
  return request<void>(`/trips/${tripId}/journal`, {
    method: "DELETE",
    auth: true,
  });
}
