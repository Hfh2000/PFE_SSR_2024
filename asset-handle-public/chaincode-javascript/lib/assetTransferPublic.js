/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const crypto = require('crypto'); // Importation de la bibliothèque pour le hashage
const stringify = require('json-stringify-deterministic'); // Permet de sérialiser les objets en JSON de manière déterministe
const sortKeysRecursive = require('sort-keys-recursive'); // Trie les clés des objets de manière récursive pour garantir un ordre constant
const { Contract } = require('fabric-contract-api'); // Importation de la classe de base Contract d'Hyperledger Fabric

class AssetTransferPublic extends Contract {
    
    /**
     * Initialise le registre (ledger) avec des empreintes radio et adresses MAC hashées par défaut.
     */
    async InitLedger(ctx) {
        const assets = [
            { hash: crypto.createHash('sha256').update('empreinte1').digest('hex') },
            { hash: crypto.createHash('sha256').update('00:0a:95:9d:68:16').digest('hex')},
            { hash: crypto.createHash('sha256').update('empreinte2').digest('hex') },
            { hash: crypto.createHash('sha256').update('00:0a:95:9d:68:17').digest('hex')}
        ];

        for (const asset of assets) {
            await ctx.stub.putState(asset.hash, Buffer.from(stringify(sortKeysRecursive(asset))));
        }
    }

    /**
     * Enregistre un hash d'empreinte radio ou d'adresse MAC dans la blockchain.
     */
    async StoreAssetHash(ctx, asset) {
        const hash = crypto.createHash('sha256').update(asset).digest('hex');
        const exists = await this.AssetHashExists(ctx, hash);
        if (exists) {
            throw new Error(`L'empreinte radio ou l'adresse MAC hashée ${hash} existe déjà.`);
        }

        const asset_hash = { hash };
        await ctx.stub.putState(hash, Buffer.from(stringify(sortKeysRecursive(asset_hash))));
        return JSON.stringify(asset_hash); // Retourne l'asset sous forme JSON
    }

   /**
     * Vérifie si un hash d'empreinte radio ou d'adresse MAC existe dans la blockchain.
     */
    async VerifyAssetHash(ctx, asset) {
        const hash = crypto.createHash('sha256').update(asset).digest('hex');
        const exists = await this.AssetHashExists(ctx, hash);
        return exists ? `Correspondance ${hash} trouvée dans la blockchain.` : `Correspondance ${hash} non trouvée.`;
    }

    /**
     * Vérifie si un hash d'empreinte radio ou d'adresse MAC est enregistré dans la blockchain.
     */
    async AssetHashExists(ctx, hash) {
        const assetJSON = await ctx.stub.getState(hash);
        return assetJSON && assetJSON.length > 0;
    }


    /**
     * Récupère tous les hash stockés dans la blockchain.
     * Effectue une requête de type range query pour récupérer toutes les données.
     */
    async GetAllAssets(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue); // Conversion en objet JSON
            } catch (err) {
                console.log(err);
                record = strValue; // En cas d'erreur, on stocke la valeur brute
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults); // Retourne la liste des assets sous forme JSON
    }
}

module.exports = AssetTransferPublic;

