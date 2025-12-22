import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * CORS Configuration
 * 
 * Defines which origins can access the API and what methods/headers are allowed.
 * For development, we allow all origins. In production, you should restrict this.
 */

// Allowed origins for CORS
// In production, replace '*' with specific origins like:
// ['https://your-app.com', 'exp://192.168.1.x:8081']
const ALLOWED_ORIGINS = [
  "*", // Allow all origins in development
  // Add specific origins in production:
  // "https://your-production-domain.com",
  // "exp://localhost:8081",
  // "exp://192.168.x.x:8081",
];

// CORS headers
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // Allow all origins (dev only)
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400", // Cache preflight for 24 hours
};

/**
 * Add CORS headers to a response
 */
export function corsHeaders(response: NextResponse): NextResponse {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Handle preflight OPTIONS request
 */
export function handlePreflight(): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Create a JSON response with CORS headers
 */
export function corsJsonResponse(
  data: unknown,
  options: { status?: number } = {}
): NextResponse {
  const response = NextResponse.json(data, { status: options.status || 200 });
  return corsHeaders(response);
}

/**
 * Create an error response with CORS headers
 */
export function corsErrorResponse(
  message: string,
  status: number = 500
): NextResponse {
  return corsJsonResponse({ error: message }, { status });
}

/**
 * Check if origin is allowed (for production use)
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true; // Allow requests without origin (e.g., curl)
  if (ALLOWED_ORIGINS.includes("*")) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

/**
 * Middleware helper to add CORS headers
 * Use this in your middleware.ts if needed
 */
export function addCorsToRequest(request: NextRequest): NextResponse | null {
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return handlePreflight();
  }
  return null;
}
