/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Importation des bibliothèques nécessaires pour le fonctionnement du smart contract
const stringify  = require('json-stringify-deterministic'); // Permet de sérialiser les objets en JSON de manière déterministe
const sortKeysRecursive  = require('sort-keys-recursive'); // Trie les clés des objets de manière récursive pour garantir un ordre constant
const { Contract } = require('fabric-contract-api'); // Importation de la classe de base Contract d'Hyperledger Fabric

// Définition de la classe AssetTransfer qui représente le Smart Contract
class AssetTransfer extends Contract {

    /**
     * Initialise le registre (ledger) avec des objets IoT par défaut.
     * Cette fonction est appelée lors du déploiement du Smart Contract.
     */
    async InitLedger(ctx) {
        const assets = [
            {
                id: 'SN-1',
                idCloudProvider: 'cloud_provider_1',
                empreinteRadio: 'empreinte1',
                adresseMac: '00:0a:95:9d:68:16',
                idFabricant: 'fabricant_1'
            },
            {
                id: 'SN-2',
                idCloudProvider: 'cloud_provider_2',
                empreinteRadio: 'empreinte2',
                adresseMac: '00:0a:95:9d:68:17',
                idFabricant: 'fabricant_1'
            }
        ];

        for (const asset of assets) {
            asset.docType = 'asset'; // Ajout du type de document pour classification
            // Ajout de l'asset au registre de la blockchain avec tri déterministe des clés
            await ctx.stub.putState(asset.id, Buffer.from(stringify(sortKeysRecursive(asset))));
        }
    }

    /**
     * Crée un nouvel IoTAsset et l'enregistre dans la blockchain.
     * Vérifie d'abord si l'asset n'existe pas déjà.
     */
    async CreateAsset(ctx, id, idCloudProvider, empreinteRadio, adresseMac, idFabricant) {
        const exists = await this.AssetExists(ctx, id);
        if (exists) {
            throw new Error(`L'actif ${id} existe déjà`);
        }

        // Création de l'objet IoTAsset
        const asset = {
            id,
            idCloudProvider,
            empreinteRadio,
            adresseMac,
            idFabricant
        };
        // Sérialisation en JSON et stockage dans la blockchain
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return JSON.stringify(asset); // Retourne l'asset sous forme JSON
    }

    /**
     * Recherche un IoTAsset par son empreinte radio en parcourant tous les actifs stockés.
     */
    async ReadAssetByEmpreinte(ctx, empreinteRadio) {
        // Récupération de tous les actifs sous forme de JSON
        const allAssets = JSON.parse(await this.GetAllAssets(ctx));
        
        // Parcours des actifs pour trouver celui correspondant à l'empreinte radio
        for (const asset of allAssets) {
            if (asset.empreinteRadio === empreinteRadio) {
                return JSON.stringify(asset); // Retourne l'asset trouvé sous forme JSON
            }
        }
        throw new Error(`Aucun actif trouvé avec l'empreinte radio '${empreinteRadio}'`);
    }

    /**
     * Recherche un IoTAsset par son adresse MAC en parcourant tous les actifs stockés.
     */
    async ReadAssetByMac(ctx, adresseMac) {
        // Récupération de tous les actifs sous forme de JSON
        const allAssets = JSON.parse(await this.GetAllAssets(ctx));
        
        // Parcours des actifs pour trouver celui correspondant à l'adresse MAC
        for (const asset of allAssets) {
            if (asset.adresseMac === adresseMac) {
                return JSON.stringify(asset); // Retourne l'asset trouvé sous forme JSON
            }
        }
        throw new Error(`Aucun actif trouvé avec l'adresse MAC '${adresseMac}'`);
    }

    /**
     * Vérifie si un IoTAsset existe dans la blockchain en utilisant son ID.
     */
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    /**
     * Vérifie si un IoTAsset existe dans la blockchain en fonction de son empreinte radio.
     */
    async AssetExistsByEmpreinte(ctx, empreinteRadio) {
        const allAssets = JSON.parse(await this.GetAllAssets(ctx));
        for (const asset of allAssets) {
            if (asset.empreinteRadio === empreinteRadio) {
                return true;
            }
        }
        return false;
    }

    /**
     * Vérifie si un IoTAsset existe dans la blockchain en fonction de son adresse MAC.
     */
    async AssetExistsByMac(ctx, adresseMac) {
        const allAssets = JSON.parse(await this.GetAllAssets(ctx));
        for (const asset of allAssets) {
            if (asset.adresseMac === adresseMac) {
                return true;
            }
        }
        return false;
    }

    /**
     * Récupère tous les IoTAssets stockés dans la blockchain.
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

// Exportation de la classe AssetTransfer pour être utilisée par Hyperledger Fabric
module.exports = AssetTransfer;

