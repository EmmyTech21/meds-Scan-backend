// utils.js
const crypto = require('crypto');

async function submitTransactionWithRetry(contract, transactionName, ...args) {
  const maxRetries = 5;
  const delay = 2000; // 2 seconds

  for (let i = 0; i < maxRetries; i++) {
    try {
      await contract.submitTransaction(transactionName, ...args);
      return;
    } catch (error) {
      console.error(`Transaction attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

function generateBlockchainAddress(productId) {
  return crypto.createHash('sha256').update(productId.toString()).digest('hex');
}

module.exports = {
  submitTransactionWithRetry,
  generateBlockchainAddress
};