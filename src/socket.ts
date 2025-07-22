import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Message } from './messages/model/message.model';

export function setupSocketServer(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('joinRoom', async ({ roomId }) => {
      socket.join(roomId);
      const history = await Message.find({ roomId }).sort({ timestamp: 1 });
      socket.emit('chatHistory', history);
    });

    socket.on('sendMessage', async (data) => {
      const newMessage = new Message({
        roomId: data.roomId,
        sender: data.sender,
        text: data.text,
      });
      await newMessage.save();
      io.to(data.roomId).emit('receiveMessage', newMessage);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
