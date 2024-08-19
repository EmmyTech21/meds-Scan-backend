const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, updateMessage, deleteMessage } = require('../controllers/messageController');

router.post('/', sendMessage);
router.get('/:senderId/:receiverId', getMessages);
router.put('/:messageId', updateMessage);
router.delete('/:messageId', deleteMessage);

module.exports = router;
