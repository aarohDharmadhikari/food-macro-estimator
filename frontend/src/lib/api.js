/**
 * Backend API client.
 * BASE is empty in development (Vite proxies /api to FastAPI).
 */
const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

async function readError(response) {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail) && body.detail[0]?.msg) return body.detail[0].msg;
  } catch {
    /* body was not JSON */
  }
  return `Request failed (HTTP ${response.status}).`;
}

/** Sends an image File/Blob to the backend and returns the NutritionResult JSON. */
export async function analyzeImage(file) {
  const form = new FormData();
  const name = file.name || "capture.jpg";
  form.append("image", file, name);

  let response;
  try {
    response = await fetch(`${BASE}/api/analyze`, { method: "POST", body: form });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running on port 8000?");
  }

  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

/** Returns { status, mode: "mock" | "gemini", model } or null if the backend is down. */
export async function fetchHealth() {
  try {
    const response = await fetch(`${BASE}/api/health`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}