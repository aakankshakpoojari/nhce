/**
 * @file socket.ts
 * @description Realtime messaging gateway (Socket.IO).
 * Shares the HTTP server with Express and reuses the same JWT auth as the REST API.
 * The database stays the source of truth — sockets only broadcast changes that the
 * REST controllers have already persisted. On reconnect the client re-syncs via REST.
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import type { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { prisma } from '../config/db.config';

let io: SocketIOServer | null = null;

/** Room name helpers keep event targeting consistent across the codebase. */
export const conversationRoom = (conversationId: string): string => `conversation:${conversationId}`;
export const userRoom = (userId: string): string => `user:${userId}`;

interface SocketAuthPayload {
  id: string;
  email?: string | null;
  role?: string;
}

/**
 * Attach a Socket.IO server to the existing HTTP listener.
 * Handshake auth: client passes `{ auth: { token } }` (or an Authorization header).
 */
export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: '*' },
  });

  io.use((socket: Socket, next) => {
    const headerToken = socket.handshake.headers['authorization']?.toString().split(' ')[1];
    const token = (socket.handshake.auth?.token as string | undefined) || headerToken;

    if (!token) {
      next(new Error('Access Denied: Missing authentication token'));
      return;
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as SocketAuthPayload;
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;
      next();
    } catch {
      next(new Error('Forbidden: Invalid or expired token'));
    }
  });

  /**
   * Ensure this socket is in the conversation room, verifying DB membership.
   * Idempotent and self-healing: safe to call on every relevant event so a
   * dropped/raced `conversation:join` can never permanently break realtime.
   */
  const ensureMember = async (socket: Socket, conversationId: string): Promise<boolean> => {
    if (socket.rooms.has(conversationRoom(conversationId))) return true;
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: socket.data.userId } },
    });
    if (!participant) return false;
    socket.join(conversationRoom(conversationId));
    return true;
  };

  io.on('connection', (socket: Socket) => {
    const userId: string = socket.data.userId;

    // Personal room — receives conversation-list level events (e.g. new message
    // in a thread the user is not currently viewing).
    socket.join(userRoom(userId));
    console.log(`[Socket] connected user=${userId} id=${socket.id}`);

    // Join a conversation thread after verifying membership against the DB.
    socket.on('conversation:join', async (conversationId: unknown) => {
      if (typeof conversationId !== 'string' || !conversationId) return;
      try {
        const joined = await ensureMember(socket, conversationId);
        console.log(`[Socket] join conv=${conversationId} user=${userId} -> ${joined ? 'ok' : 'denied'}`);
      } catch (err) {
        console.error(`[Socket] join failed conv=${conversationId} user=${userId}:`, err);
      }
    });

    socket.on('conversation:leave', (conversationId: unknown) => {
      if (typeof conversationId === 'string' && conversationId) {
        socket.leave(conversationRoom(conversationId));
      }
    });

    // Ephemeral typing indicator — never touches the DB beyond the membership
    // check. Relayed only to the other participant(s) in the thread.
    socket.on('typing', async (payload: unknown) => {
      const data = payload as { conversationId?: string; isTyping?: boolean } | null;
      const conversationId = data?.conversationId;
      if (typeof conversationId !== 'string' || !conversationId) return;
      try {
        if (!(await ensureMember(socket, conversationId))) {
          console.log(`[Socket] typing dropped (not a member) conv=${conversationId} user=${userId}`);
          return;
        }
        socket.to(conversationRoom(conversationId)).emit('typing', {
          conversationId,
          userId,
          isTyping: Boolean(data?.isTyping),
        });
      } catch (err) {
        console.error(`[Socket] typing relay failed conv=${conversationId} user=${userId}:`, err);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] disconnected user=${userId} id=${socket.id} (${reason})`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

/** Broadcast to everyone currently viewing a conversation thread. */
export function emitToConversation(conversationId: string, event: string, payload: unknown): void {
  io?.to(conversationRoom(conversationId)).emit(event, payload);
}

/** Broadcast to a specific user across all their connected sockets. */
export function emitToUser(userId: string, event: string, payload: unknown): void {
  io?.to(userRoom(userId)).emit(event, payload);
}
