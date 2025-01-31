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
     * Initialise le registre (ledger) avec des empreintes radio hashées par défaut.
     */
    async InitLedger(ctx) {
        const fingerprints = [
            { hash: crypto.createHash('sha256').update('empreinte1').digest('hex') },
            { hash: crypto.createHash('sha256').update('empreinte2').digest('hex') }
        ];

        for (const fingerprint of fingerprints) {
            await ctx.stub.putState(fingerprint.hash, Buffer.from(stringify(sortKeysRecursive(fingerprint))));
        }
    }

    /**
     * Enregistre un hash d'empreinte radio dans la blockchain.
     */
    async StoreRadioFingerprintHash(ctx, empreinteRadio) {
        const hash = crypto.createHash('sha256').update(empreinteRadio).digest('hex');
        const exists = await this.FingerprintHashExists(ctx, hash);
        if (exists) {
            throw new Error(`L'empreinte hashée ${hash} existe déjà.`);
        }

        const asset = { hash };
        await ctx.stub.putState(hash, Buffer.from(stringify(sortKeysRecursive(asset))));
        return JSON.stringify(asset); // Retourne l'asset sous forme JSON
    }

    /**
     * Vérifie si un hash d'empreinte radio existe dans la blockchain.
     */
    async VerifyRadioFingerprintHash(ctx, hash) {
        const exists = await this.FingerprintHashExists(ctx, hash);
        return exists ? `Empreinte ${hash} trouvée dans la blockchain.` : `Empreinte ${hash} non trouvée.`;
    }

    /**
     * Vérifie si un hash d'empreinte radio est enregistré dans la blockchain.
     */
    async FingerprintHashExists(ctx, hash) {
        const assetJSON = await ctx.stub.getState(hash);
        return assetJSON && assetJSON.length > 0;
    }
}

module.exports = AssetTransferPublic;

