'use strict';

const { Contract } = require('fabric-contract-api');

class MyChaincode extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const assets = [
            {
                id: 'asset1',
                value: '100'
            },
            {
                id: 'asset2',
                value: '200'
            }
        ];

        for (let i = 0; i < assets.length; i++) {
            await ctx.stub.putState(assets[i].id, Buffer.from(JSON.stringify(assets[i])));
            console.info(`Asset ${assets[i].id} initialized`);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryAsset(ctx, assetId) {
        const assetAsBytes = await ctx.stub.getState(assetId);
        if (!assetAsBytes || assetAsBytes.length === 0) {
            throw new Error(`${assetId} does not exist`);
        }
        return assetAsBytes.toString();
    }

    async createAsset(ctx, assetId, value) {
        console.info('============= START : Create Asset ===========');
        const asset = {
            id: assetId,
            value: value
        };

        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
        console.info('============= END : Create Asset ===========');
    }
}

module.exports = MyChaincode;