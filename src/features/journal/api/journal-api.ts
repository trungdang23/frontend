import { env } from "@/app/config/env";
import { request } from "@/shared/api/http-client";
import type {
  JournalSceneObject,
  SaveTripJournalPayload,
  TripJournalAssetListResult,
  TripJournalAssetResult,
  TripJournalRevisionListResult,
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
  const result = await request<TripJournalResult>(`/trips/${tripId}/journal`, {
    auth: true,
    signal: options.signal,
  });

  return normalizeTripJournalAssetUrls(result);
}

export async function getPublicTripJournal(
  tripId: string,
  options: RequestOptions = {},
) {
  const result = await request<TripJournalResult>(
    `/public/trips/${tripId}/journal`,
    {
      signal: options.signal,
    },
  );

  return normalizeTripJournalAssetUrls(result);
}

export async function listMyJournals(options: RequestOptions = {}) {
  const results = await request<TripJournalResult[]>("/journals/mine", {
    auth: true,
    signal: options.signal,
  });

  return results.map(normalizeTripJournalAssetUrls);
}

export async function listPublicJournals(options: RequestOptions = {}) {
  const results = await request<TripJournalResult[]>("/public/journals", {
    signal: options.signal,
  });

  return results.map(normalizeTripJournalAssetUrls);
}

export async function saveTripJournal(
  tripId: string,
  payload: SaveTripJournalPayload,
) {
  const result = await request<TripJournalResult, SaveTripJournalPayload>(
    `/trips/${tripId}/journal`,
    {
      method: "PUT",
      auth: true,
      body: payload,
    },
  );

  return normalizeTripJournalAssetUrls(result);
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
  const result = await request<TripJournalResult, UpdateTripJournalPayload>(
    `/trips/${tripId}/journal`,
    {
      method: "PATCH",
      auth: true,
      body: payload,
    },
  );

  return normalizeTripJournalAssetUrls(result);
}

export async function listTripJournalRevisions(
  tripId: string,
  options: RequestOptions = {},
) {
  return request<TripJournalRevisionListResult>(
    `/trips/${tripId}/journal/revisions`,
    {
      auth: true,
      signal: options.signal,
    },
  );
}

export async function restoreTripJournalRevision(
  tripId: string,
  revisionId: string,
) {
  const result = await request<TripJournalResult>(
    `/trips/${tripId}/journal/revisions/${revisionId}/restore`,
    {
      method: "POST",
      auth: true,
    },
  );

  return normalizeTripJournalAssetUrls(result);
}

export async function deleteTripJournal(tripId: string) {
  return request<void>(`/trips/${tripId}/journal`, {
    method: "DELETE",
    auth: true,
  });
}

export function normalizeTripJournalAssetUrls(
  result: TripJournalResult,
): TripJournalResult {
  return {
    ...result,
    journal: {
      ...result.journal,
      objects: result.journal.objects.map(normalizeJournalSceneObject),
    },
  };
}

function normalizeJournalSceneObject(
  object: JournalSceneObject,
): JournalSceneObject {
  if (object.type !== "photo") {
    return object;
  }

  const props = object.props ?? {};
  const imageUrl = getStringProp(props, "imageUrl");
  const src = getStringProp(props, "src");
  const assetId = getStringProp(props, "assetId");

  if (!assetId && !isJournalAssetUrl(imageUrl) && !isJournalAssetUrl(src)) {
    return object;
  }

  return {
    ...object,
    props: {
      ...props,
      ...(imageUrl ? { imageUrl: resolveJournalAssetUrl(imageUrl) } : {}),
      ...(src && isJournalAssetUrl(src)
        ? { src: resolveJournalAssetUrl(src) }
        : {}),
    },
  };
}

function getStringProp(props: Record<string, unknown>, key: string) {
  const value = props[key];

  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function isJournalAssetUrl(pathOrUrl: string | null) {
  return pathOrUrl !== null && /(?:^|\/)journal-assets\//.test(pathOrUrl);
}
