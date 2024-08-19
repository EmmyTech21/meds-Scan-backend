const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

async function registerUser(userId) {
    try {
        const ccpPath = path.resolve(__dirname, '..', 'config', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
        const ca = new FabricCAServices(caURL);

        // Explicitly set the wallet path
        const walletPath = '/Users/newowner/Desktop/meds-Scan-backend/wallet';
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const userExists = await wallet.get(userId);
        if (userExists) {
            console.log(`An identity for the user "${userId}" already exists in the wallet`);
            return;
        }

        const adminExists = await wallet.get('admin');
        if (!adminExists) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            return;
        }

        const adminIdentity = await wallet.get('admin');
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: userId,
            role: 'client'
        }, adminUser);

        const enrollment = await ca.enroll({
            enrollmentID: userId,
            enrollmentSecret: secret
        });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put(userId, x509Identity);
        console.log(`Successfully enrolled user "${userId}" and imported it into the wallet`);
    } catch (error) {
        console.error(`Failed to register user "${userId}": ${error}`);
    }
}

module.exports = { registerUser };