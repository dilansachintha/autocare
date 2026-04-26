import { Response, NextFunction } from 'express';
import * as feedbackService from '../services/feedback.service';
import { AuthRequest } from '../types';

export const submitFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const feedback = await feedbackService.createFeedback(req.user!.id, req.body);
    res.status(201).json({ success: true, message: 'Feedback submitted', data: feedback });
  } catch (error) { next(error); }
};

export const getAllFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const result = await feedbackService.getFeedbacks(Number(page) || 1, Number(limit) || 10);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};
