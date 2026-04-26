import { Response, NextFunction } from 'express';
import * as messageService from '../services/message.service';
import { AuthRequest } from '../types';

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { recipientId, content, appointmentId } = req.body;
    const message = await messageService.sendMessage(req.user!.id, recipientId, content, appointmentId);
    // Emit via socket.io
    const io = req.app.get('io');
    io.to(recipientId).emit('new_message', message);
    res.status(201).json({ success: true, data: message });
  } catch (error) { next(error); }
};

export const getConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const messages = await messageService.getConversation(
      req.user!.id, req.params.userId, Number(page) || 1, Number(limit) || 50
    );
    res.json({ success: true, data: messages });
  } catch (error) { next(error); }
};

export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const conversations = await messageService.getConversationList(req.user!.id);
    res.json({ success: true, data: conversations });
  } catch (error) { next(error); }
};
