const WS_URL =
  // Public env var for configuring WebSocket endpoint in production
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

/**
 * Create a WebSocket connected to the multiplayer server.
 * Falls back to localhost:3001 in development if no env var is set.
 */
export function createWebSocket() {
  return new WebSocket(WS_URL);
}
