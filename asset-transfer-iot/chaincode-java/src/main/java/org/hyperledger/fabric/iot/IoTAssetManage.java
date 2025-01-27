/*
 * SPDX-License-Identifier: Apache-2.0
 */

package org.hyperledger.fabric.iot;

import java.util.ArrayList;
import java.util.List;

import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.contract.ContractInterface;
import org.hyperledger.fabric.contract.annotation.Contract;
import org.hyperledger.fabric.contract.annotation.Default;
import org.hyperledger.fabric.contract.annotation.Transaction;
import org.hyperledger.fabric.shim.ChaincodeException;
import org.hyperledger.fabric.shim.ChaincodeStub;
import org.hyperledger.fabric.shim.ledger.KeyValue;
import org.hyperledger.fabric.shim.ledger.QueryResultsIterator;

import com.owlike.genson.Genson;

@Contract(name = "IoTAssetManage") // Annotation pour définir le nom du contrat

@Default // Indique que cette classe sera utilisée comme contrat par défaut si aucun n'est spécifié
public class IoTAssetManage implements ContractInterface {

    private final Genson genson = new Genson(); // Utilisé pour la sérialisation et la désérialisation JSON

    // Enumération pour gérer les erreurs spécifiques au contrat
    private enum IoTAssetErrors {
        ASSET_NOT_FOUND, // Erreur si un asset est introuvable
        ASSET_ALREADY_EXISTS // Erreur si un asset existe déjà
    }

    /**
     * Initialise le ledger avec quelques données de test.
     * Cette méthode est appelée pour insérer des données initiales dans la blockchain.
     *
     * @param ctx le contexte de transaction
     */
    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public void InitLedger(final Context ctx) {
        // Liste d'IoTAssets à insérer dans le ledger
        List<IoTAsset> initialAssets = new ArrayList<>();
        initialAssets.add(new IoTAsset("SN-1", "cloud_provider_1", "empreinte1", "00:0a:95:9d:68:16", "fabricant_1"));
        initialAssets.add(new IoTAsset("SN-2", "cloud_provider_2", "empreinte2", "00:0a:95:9d:68:17", "fabricant_1"));

        // Parcours de chaque asset et insertion dans le ledger
        for (IoTAsset asset : initialAssets) {
            String assetJson = genson.serialize(asset); // Sérialisation en JSON
            ctx.getStub().putStringState(asset.getId(), assetJson); // Sauvegarde dans la blockchain
        }
    }

    /**
     * Crée un nouvel IoTAsset.
     *
     * @param ctx le contexte de transaction
     * @param id l'identifiant unique de l'IoTAsset
     * @param idCloudProvider l'identifiant du fournisseur cloud
     * @param empreinteRadio l'empreinte radio unique
     * @param adresseMac l'adresse MAC
     * @param idFabricant l'identifiant du fabricant
     * @return l'IoTAsset créé
     */
    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public IoTAsset CreateIoTAsset(
            final Context ctx,
            final String id,
            final String idCloudProvider,
            final String empreinteRadio,
            final String adresseMac,
            final String idFabricant) {

        // Vérifie si l'asset existe déjà
        if (IoTAssetExists(ctx, id)) {
            String errorMessage = String.format("IoTAsset %s already exists", id);
            throw new ChaincodeException(errorMessage, IoTAssetErrors.ASSET_ALREADY_EXISTS.toString());
        }

        // Création de l'IoTAsset
        IoTAsset asset = new IoTAsset(id, idCloudProvider, empreinteRadio, adresseMac, idFabricant);
        String assetJson = genson.serialize(asset); // Sérialisation en JSON
        ctx.getStub().putStringState(id, assetJson); // Sauvegarde dans la blockchain

        return asset; // Retourne l'asset créé
    }
    /**
     * Lit un IoTAsset par son empreinte radio.
     *
     * @param ctx le contexte de transaction
     * @param empreinteRadio l'empreinte radio de l'IoTAsset
     * @return l'IoTAsset trouvé
     */
    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public IoTAsset ReadIoTAssetByEmpreinte(final Context ctx, final String empreinteRadio) {
        QueryResultsIterator<KeyValue> results = ctx.getStub().getStateByRange("", "");

        for (KeyValue result : results) {
            IoTAsset asset = genson.deserialize(result.getStringValue(), IoTAsset.class);
            if (asset.getEmpreinteRadio().equals(empreinteRadio)) {
                return asset;
            }
        }

        throw new ChaincodeException("IoTAsset with empreinte '" + empreinteRadio + "' does not exist", IoTAssetErrors.ASSET_NOT_FOUND.toString());
    }

    /**
     * Lit un IoTAsset par son adresse MAC.
     *
     * @param ctx le contexte de transaction
     * @param adresseMac l'adresse MAC de l'IoTAsset
     * @return l'IoTAsset trouvé
     */
    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public IoTAsset ReadIoTAssetByMac(final Context ctx, final String adresseMac) {
        QueryResultsIterator<KeyValue> results = ctx.getStub().getStateByRange("", "");

        for (KeyValue result : results) {
            IoTAsset asset = genson.deserialize(result.getStringValue(), IoTAsset.class);
            if (asset.getAdresseMac().equals(adresseMac)) {
                return asset;
            }
        }

        throw new ChaincodeException("IoTAsset with MAC address '" + adresseMac + "' does not exist", IoTAssetErrors.ASSET_NOT_FOUND.toString());
    }

    /**
     * Vérifie si un IoTAsset existe par son empreinte radio.
     *
     * @param ctx le contexte de transaction
     * @param empreinteRadio l'empreinte radio de l'IoTAsset
     * @return vrai si l'IoTAsset existe, faux sinon
     */
    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public boolean IoTAssetExistsByEmpreinte(final Context ctx, final String empreinteRadio) {
        QueryResultsIterator<KeyValue> results = ctx.getStub().getStateByRange("", "");

        for (KeyValue result : results) {
            IoTAsset asset = genson.deserialize(result.getStringValue(), IoTAsset.class);
            if (asset.getEmpreinteRadio().equals(empreinteRadio)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Vérifie si un IoTAsset existe par son adresse MAC.
     *
     * @param ctx le contexte de transaction
     * @param adresseMac l'adresse MAC de l'IoTAsset
     * @return vrai si l'IoTAsset existe, faux sinon
     */
    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public boolean IoTAssetExistsByMac(final Context ctx, final String adresseMac) {
        QueryResultsIterator<KeyValue> results = ctx.getStub().getStateByRange("", "");

        for (KeyValue result : results) {
            IoTAsset asset = genson.deserialize(result.getStringValue(), IoTAsset.class);
            if (asset.getAdresseMac().equals(adresseMac)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Vérifie si un IoTAsset existe par son identifiant.
     *
     * @param ctx le contexte de transaction
     * @param id l'identifiant unique de l'IoTAsset
     * @return vrai si l'IoTAsset existe, faux sinon
     */
    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public boolean IoTAssetExists(final Context ctx, final String id) {
        String assetJson = ctx.getStub().getStringState(id);
        return (assetJson != null && !assetJson.isEmpty());
    }


    /**
     * Récupère tous les IoTAssets.
     *
     * @param ctx le contexte de transaction
     * @return une liste de tous les IoTAssets
     */
    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public String GetAllIoTAssets(final Context ctx) {
        ChaincodeStub stub = ctx.getStub();

        List<IoTAsset> queryResults = new ArrayList<>();

        QueryResultsIterator<KeyValue> results = stub.getStateByRange("", "");

        for (KeyValue result : results) {
            IoTAsset asset = genson.deserialize(result.getStringValue(), IoTAsset.class);
            queryResults.add(asset);
        }

        return genson.serialize(queryResults);
    }
}

