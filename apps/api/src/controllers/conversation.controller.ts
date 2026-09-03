/**
 * @file conversation.controller.ts
 * @description Messaging Controller.
 * Conversations normally belong to a Job and link that Job's client and freelancer.
 * The sender of a message is ALWAYS derived from the authenticated session — it is
 * never read from the request body. Every read/write is gated on the caller being a
 * participant of the target conversation.
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/db.config';
import { emitToConversation, emitToUser } from '../realtime/socket';

const MAX_MESSAGE_LENGTH = 5000;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

/** Error thrown inside helpers and translated to an HTTP response by the caller. */
class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type MessageRow = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
};

/** Public message shape. Soft-deleted messages never leak their original content. */
function toMessageDTO(m: MessageRow) {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    content: m.deletedAt ? '' : m.content,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    editedAt: m.editedAt,
    deletedAt: m.deletedAt,
    isDeleted: Boolean(m.deletedAt),
  };
}

export class ConversationController {
  /**
   * Resolve the caller's participant row or fail. Returns 404 for both "no such
   * conversation" and "not a member" so conversation existence is never leaked.
   */
  private async requireParticipant(conversationId: string, userId: string) {
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!participant) {
      throw new HttpError(404, 'Conversation not found');
    }
    return participant;
  }

  private validateContent(raw: unknown): string {
    const content = typeof raw === 'string' ? raw.trim() : '';
    if (!content) {
      throw new HttpError(400, 'Message content is required');
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
      throw new HttpError(400, `Message content must be ${MAX_MESSAGE_LENGTH} characters or fewer`);
    }
    return content;
  }

  /** Serialize a conversation for the given viewer (adds their unread count). */
  private async toConversationDTO(conversationId: string, viewerId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        job: { select: { id: true, title: true, status: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true, rating: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!conversation) {
      throw new HttpError(404, 'Conversation not found');
    }

    const viewer = conversation.participants.find((p) => p.userId === viewerId);
    const since = viewer?.lastReadAt ?? new Date(0);
    const unreadCount = await prisma.message.count({
      where: {
        conversationId,
        deletedAt: null,
        senderId: { not: viewerId },
        createdAt: { gt: since },
      },
    });

    const lastMessage = conversation.messages[0] ? toMessageDTO(conversation.messages[0]) : null;

    return {
      id: conversation.id,
      jobId: conversation.jobId,
      job: conversation.job,
      participants: conversation.participants.map((p) => ({
        userId: p.userId,
        name: p.user.name,
        email: p.user.email,
        role: p.user.role,
        rating: p.user.rating,
        lastReadAt: p.lastReadAt,
        joinedAt: p.joinedAt,
      })),
      lastMessage,
      unreadCount,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  /**
   * POST /api/conversations
   * Body: { jobId }
   * Open (or create) the conversation for a job. Idempotent: a given job always
   * resolves to the same conversation. Caller must be the job's client or freelancer.
   */
  public async createOrGetConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const jobId = typeof req.body?.jobId === 'string' ? req.body.jobId.trim() : '';
      if (!jobId) {
        res.status(400).json({ error: 'jobId is required' });
        return;
      }

      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { id: true, clientId: true, freelancerId: true },
      });
      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      const isClient = job.clientId === req.user.id;
      const isFreelancer = !!job.freelancerId && job.freelancerId === req.user.id;
      if (!isClient && !isFreelancer && req.user.role !== 'ADMIN') {
        res.status(403).json({ error: 'Forbidden: You are not part of this job' });
        return;
      }

      if (!job.freelancerId) {
        res.status(409).json({
          error: 'A conversation opens once a freelancer has been selected for this job',
        });
        return;
      }

      const existing = await prisma.conversation.findUnique({ where: { jobId } });

      let created = false;
      if (!existing) {
        await prisma.conversation.create({
          data: {
            jobId,
            participants: {
              create: [{ userId: job.clientId }, { userId: job.freelancerId }],
            },
          },
        });
        created = true;
      }

      const conversation = await prisma.conversation.findUnique({ where: { jobId } });
      const dto = await this.toConversationDTO(conversation!.id, req.user.id);
      res.status(created ? 201 : 200).json({ conversation: dto, created });
    } catch (error: any) {
      if (error instanceof HttpError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to open conversation', message: error.message });
    }
  }

  /**
   * GET /api/conversations
   * List the authenticated user's conversations, newest activity first.
   */
  public async listConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const memberships = await prisma.conversationParticipant.findMany({
        where: { userId: req.user.id },
        select: { conversationId: true, conversation: { select: { updatedAt: true } } },
      });

      memberships.sort(
        (a, b) => b.conversation.updatedAt.getTime() - a.conversation.updatedAt.getTime()
      );

      const conversations = await Promise.all(
        memberships.map((m) => this.toConversationDTO(m.conversationId, req.user!.id))
      );

      res.json({ conversations });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch conversations', message: error.message });
    }
  }

  /**
   * GET /api/conversations/:id
   * Fetch a single conversation the caller belongs to.
   */
  public async getConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const conversationId = String(req.params.id);
      await this.requireParticipant(conversationId, req.user.id);
      const dto = await this.toConversationDTO(conversationId, req.user.id);
      res.json({ conversation: dto });
    } catch (error: any) {
      if (error instanceof HttpError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch conversation', message: error.message });
    }
  }

  /**
   * GET /api/conversations/:id/messages?limit=&before=
   * Messages in ascending (oldest-first) order. `before` (ISO date) paginates back.
   */
  public async getMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const conversationId = String(req.params.id);
      await this.requireParticipant(conversationId, req.user.id);

      const rawLimit = Number(req.query.limit);
      const limit = Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(Math.floor(rawLimit), MAX_PAGE_SIZE)
        : DEFAULT_PAGE_SIZE;

      const where: { conversationId: string; createdAt?: { lt: Date } } = { conversationId };
      if (typeof req.query.before === 'string' && req.query.before) {
        const before = new Date(req.query.before);
        if (isNaN(before.getTime())) {
          res.status(400).json({ error: 'before must be a valid ISO date' });
          return;
        }
        where.createdAt = { lt: before };
      }

      // Take the newest `limit` rows in the window, then present oldest-first.
      const rows = await prisma.message.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      res.json({ messages: rows.reverse().map(toMessageDTO) });
    } catch (error: any) {
      if (error instanceof HttpError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to fetch messages', message: error.message });
    }
  }

  /**
   * POST /api/conversations/:id/messages
   * Body: { content }. Sender is taken from the session, never the body.
   */
  public async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const conversationId = String(req.params.id);
      await this.requireParticipant(conversationId, req.user.id);
      const content = this.validateContent(req.body?.content);
      const senderId = req.user.id;

      const message = await prisma.$transaction(async (tx) => {
        const created = await tx.message.create({
          data: { conversationId, senderId, content },
        });
        // Bump conversation activity for list ordering.
        await tx.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });
        // The sender has implicitly read up to their own message.
        await tx.conversationParticipant.update({
          where: { conversationId_userId: { conversationId, userId: senderId } },
          data: { lastReadAt: created.createdAt },
        });
        return created;
      });

      const dto = toMessageDTO(message);

      // Realtime fan-out: thread viewers + every participant's personal room.
      emitToConversation(conversationId, 'message:new', { conversationId, message: dto });
      const participants = await prisma.conversationParticipant.findMany({
        where: { conversationId },
        select: { userId: true },
      });
      participants
        .filter((p) => p.userId !== senderId)
        .forEach((p) => emitToUser(p.userId, 'message:new', { conversationId, message: dto }));

      res.status(201).json({ message: dto });
    } catch (error: any) {
      if (error instanceof HttpError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to send message', message: error.message });
    }
  }

  /**
   * POST /api/conversations/:id/read
   * Mark the conversation read up to now for the authenticated user.
   */
  public async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const conversationId = String(req.params.id);
      await this.requireParticipant(conversationId, req.user.id);

      const lastReadAt = new Date();
      await prisma.conversationParticipant.update({
        where: { conversationId_userId: { conversationId, userId: req.user.id } },
        data: { lastReadAt },
      });

      emitToConversation(conversationId, 'conversation:read', {
        conversationId,
        userId: req.user.id,
        lastReadAt,
      });

      res.json({ conversationId, lastReadAt });
    } catch (error: any) {
      if (error instanceof HttpError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to mark conversation as read', message: error.message });
    }
  }

  /**
   * PATCH /api/conversations/:id/messages/:messageId
   * Body: { content }. Only the original sender may edit.
   */
  public async editMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const conversationId = String(req.params.id);
      const messageId = String(req.params.messageId);
      await this.requireParticipant(conversationId, req.user.id);
      const content = this.validateContent(req.body?.content);

      const existing = await prisma.message.findFirst({
        where: { id: messageId, conversationId },
      });
      if (!existing) {
        res.status(404).json({ error: 'Message not found' });
        return;
      }
      if (existing.senderId !== req.user.id) {
        res.status(403).json({ error: 'Forbidden: You can only edit your own messages' });
        return;
      }
      if (existing.deletedAt) {
        res.status(409).json({ error: 'Cannot edit a deleted message' });
        return;
      }

      const updated = await prisma.message.update({
        where: { id: messageId },
        data: { content, editedAt: new Date() },
      });

      const dto = toMessageDTO(updated);
      emitToConversation(conversationId, 'message:updated', { conversationId, message: dto });
      res.json({ message: dto });
    } catch (error: any) {
      if (error instanceof HttpError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to edit message', message: error.message });
    }
  }

  /**
   * DELETE /api/conversations/:id/messages/:messageId
   * Soft delete. Sender (or an ADMIN) only.
   */
  public async deleteMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const conversationId = String(req.params.id);
      const messageId = String(req.params.messageId);
      await this.requireParticipant(conversationId, req.user.id);

      const existing = await prisma.message.findFirst({
        where: { id: messageId, conversationId },
      });
      if (!existing) {
        res.status(404).json({ error: 'Message not found' });
        return;
      }
      if (existing.senderId !== req.user.id && req.user.role !== 'ADMIN') {
        res.status(403).json({ error: 'Forbidden: You can only delete your own messages' });
        return;
      }
      if (existing.deletedAt) {
        res.json({ message: toMessageDTO(existing) });
        return;
      }

      const updated = await prisma.message.update({
        where: { id: messageId },
        data: { deletedAt: new Date(), content: '' },
      });

      const dto = toMessageDTO(updated);
      emitToConversation(conversationId, 'message:deleted', { conversationId, message: dto });
      res.json({ message: dto });
    } catch (error: any) {
      if (error instanceof HttpError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Failed to delete message', message: error.message });
    }
  }
}

export const conversationController = new ConversationController();
