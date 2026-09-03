"use client";

/**
 * @file messagesSocket.ts
 * @description Lazy Socket.IO client singleton for realtime messaging.
 * Connects to the same origin as the REST API and authenticates with the JWT.
 * The DB is the source of truth — on any reconnect the UI re-syncs via REST.
 */

import { io, type Socket } from "socket.io-client";

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");

let socket: Socket | null = null;
let currentToken: string | null = null;

/** Returns a connected socket for the given token, recreating it if the token changed. */
export function getSocket(token: string): Socket {
  if (socket && currentToken === token) return socket;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentToken = token;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}
