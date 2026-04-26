import { Message } from '../models/Message.model';
import { User } from '../models/User.model';
import { AppError } from '../middleware/errorHandler';

export const sendMessage = async (
  senderId: string,
  recipientId: string,
  content: string,
  appointmentId?: string
) => {
  const recipient = await User.findById(recipientId);
  if (!recipient) throw new AppError('Recipient not found', 404);

  const message = await Message.create({
    sender: senderId,
    recipient: recipientId,
    content,
    appointment: appointmentId,
  });

  return message.populate(['sender', 'recipient']);
};

export const getConversation = async (userId1: string, userId2: string, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  const messages = await Message.find({
    $or: [
      { sender: userId1, recipient: userId2 },
      { sender: userId2, recipient: userId1 },
    ],
  })
    .populate('sender', 'name avatar role')
    .populate('recipient', 'name avatar role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Mark messages as read
  await Message.updateMany(
    { sender: userId2, recipient: userId1, isRead: false },
    { isRead: true }
  );

  return messages.reverse();
};

export const getConversationList = async (userId: string) => {
  const messages = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: new (require('mongoose').Types.ObjectId)(userId) },
          { recipient: new (require('mongoose').Types.ObjectId)(userId) },
        ],
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [{ $eq: ['$sender', new (require('mongoose').Types.ObjectId)(userId)] }, '$recipient', '$sender'],
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$recipient', new (require('mongoose').Types.ObjectId)(userId)] },
                  { $eq: ['$isRead', false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  // Populate user info
  const populated = await User.populate(messages, {
    path: '_id',
    select: 'name email avatar role',
  });

  return populated;
};
