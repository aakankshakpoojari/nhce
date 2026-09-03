/**
 * @file conversation.routes.ts
 * @description Messaging API Route Definitions.
 * All routes require authentication; participant checks are enforced in the controller.
 */

import { Router } from 'express';
import { conversationController } from '../controllers/conversation.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Collections
router.get('/', authenticateToken, (req, res) => conversationController.listConversations(req, res));
router.post('/', authenticateToken, (req, res) => conversationController.createOrGetConversation(req, res));

// Single conversation
router.get('/:id', authenticateToken, (req, res) => conversationController.getConversation(req, res));
router.get('/:id/messages', authenticateToken, (req, res) => conversationController.getMessages(req, res));
router.post('/:id/messages', authenticateToken, (req, res) => conversationController.sendMessage(req, res));
router.post('/:id/read', authenticateToken, (req, res) => conversationController.markAsRead(req, res));

// Message mutation (sender-only — enforced in the controller)
router.patch('/:id/messages/:messageId', authenticateToken, (req, res) => conversationController.editMessage(req, res));
router.delete('/:id/messages/:messageId', authenticateToken, (req, res) => conversationController.deleteMessage(req, res));

export default router;
