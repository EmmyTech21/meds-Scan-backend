const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function getContract(userId) {
  const ccpPath = path.resolve(__dirname, '../config/connection-org1.json');
  console.log(`Using connection profile at: ${ccpPath}`);

  let ccp;
  try {
    ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
  } catch (error) {
    console.error('Failed to read or parse connection profile:', error);
    return null;
  }

  const walletPath = path.join(process.cwd(), 'wallet');
  let wallet;
  try {
    wallet = await Wallets.newFileSystemWallet(walletPath);
  } catch (error) {
    console.error('Failed to create wallet:', error);
    return null;
  }

  let identity;
  try {
    identity = await wallet.get(userId);
  } catch (error) {
    console.error('Failed to get identity from wallet:', error);
    return null;
  }

  if (!identity) {
    console.log(`An identity for the user ${userId} does not exist in the wallet`);
    console.log('Run the registerUser.js application before retrying');
    return null;
  }

  const gateway = new Gateway();
  try {
    await gateway.connect(ccp, {
      wallet,
      identity: userId,
      discovery: { enabled: true, asLocalhost: true },
      eventHandlerOptions: {
        strategy: null // Disable default event handling strategy
      },
      clientTlsIdentity: userId,
      'grpc.keepalive_time_ms': 120000,
      'grpc.http2.min_time_between_pings_ms': 120000,
      'grpc.keepalive_timeout_ms': 20000,
      'grpc.http2.max_pings_without_data': 0,
      'grpc.keepalive_permit_without_calls': 1,
      'grpc-wait-for-ready-timeout': 6000,
      'request-timeout': 60000 // Increase request timeout to 1 minute
    });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('fabcar');

    return contract;
  } catch (error) {
    console.error('Failed to connect to gateway:', error);
    return null;
  } finally {
    gateway.disconnect();
  }
}

// Helper function to retry a given function
async function retry(fn, retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

// Function to get contract with retry logic
async function getContractWithRetry(userId) {
  try {
    return await retry(() => getContract(userId), 5, 2000);
  } catch (error) {
    console.error('Failed to get contract after retries:', error);
    throw new Error('Failed to get contract');
  }
}

module.exports = { getContract, getContractWithRetry };