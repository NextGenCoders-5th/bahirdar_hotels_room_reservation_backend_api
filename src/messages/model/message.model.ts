import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  sender: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});




export const Message = mongoose.model('Message', messageSchema);


const messageRoomSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    hotelId: { type: String, required: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [messageSchema],
});


export const MessageRoom = mongoose.model('MessageRoom', messageRoomSchema);