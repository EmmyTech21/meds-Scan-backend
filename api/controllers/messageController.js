const Message = require('../models/Message'); 

// Controller for sending a message
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    const newMessage = new Message({
      senderId,
      receiverId,
      content,
    });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    console.error('Failed to send message:', err);
    res.status(500).json({ error: 'Failed to send message', details: err.message });
  }
};

// Controller for retrieving messages
exports.getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    if (!senderId || !receiverId) {
      return res.status(400).json({ error: 'senderId and receiverId are required' });
    }

    // Fetching messages between two users
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error('Failed to retrieve messages:', err);
    res.status(500).json({ error: 'Failed to retrieve messages', details: err.message });
  }
};

// Controller for updating a message
exports.updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    // Update the message content
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { content },
      { new: true } // Return the updated document
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.status(200).json(updatedMessage);
  } catch (err) {
    console.error('Failed to update message:', err);
    res.status(500).json({ error: 'Failed to update message', details: err.message });
  }
};

// Controller for deleting a message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Delete the message by ID
    const deletedMessage = await Message.findByIdAndDelete(messageId);

    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('Failed to delete message:', err);
    res.status(500).json({ error: 'Failed to delete message', details: err.message });
  }
};
