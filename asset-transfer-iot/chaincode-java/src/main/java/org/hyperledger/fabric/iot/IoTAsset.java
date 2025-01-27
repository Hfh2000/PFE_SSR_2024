
/*
 * SPDX-License-Identifier: Apache-2.0
 */

package org.hyperledger.fabric.iot;

import java.util.Objects;
import com.owlike.genson.annotation.JsonProperty;
import org.hyperledger.fabric.contract.annotation.DataType;
import org.hyperledger.fabric.contract.annotation.Property;

//Représente un objet IoT enregistré sur la blockchain
@DataType
public final class IoTAsset {

    @Property
    private final String id; // Numéro de série

    @Property
    private final String idCloudProvider; // Identifiant du cloud provider

    @Property
    private final String empreinteRadio; // Empreinte radio

    @Property
    private final String adresseMac; // Adresse MAC

    @Property
    private final String idFabricant; // Identifiant du fabricant

    public IoTAsset(
            @JsonProperty("id") final String id,
            @JsonProperty("idCloudProvider") final String idCloudProvider,
            @JsonProperty("empreinteRadio") final String empreinteRadio,
            @JsonProperty("adresseMac") final String adresseMac,
            @JsonProperty("idFabricant") final String idFabricant) {
        this.id = id;
        this.idCloudProvider = idCloudProvider;
        this.empreinteRadio = empreinteRadio;
        this.adresseMac = adresseMac;
        this.idFabricant = idFabricant;
    }

    public String getId() {
        return id;
    }

    public String getIdCloudProvider() {
        return idCloudProvider;
    }

    public String getEmpreinteRadio() {
        return empreinteRadio;
    }

    public String getAdresseMac() {
        return adresseMac;
    }

    public String getIdFabricant() {
        return idFabricant;
    }

//Compare deux objets IoT pour vérifier leur égalité

    @Override
    public boolean equals(final Object obj) {
        if (this == obj) {
            return true;
        }

        if ((obj == null) || (getClass() != obj.getClass())) {
            return false;
        }

        IoTAsset other = (IoTAsset) obj;

        return Objects.equals(id, other.id)
                && Objects.equals(idCloudProvider, other.idCloudProvider)
                && Objects.equals(empreinteRadio, other.empreinteRadio)
                && Objects.equals(adresseMac, other.adresseMac)
                && Objects.equals(idFabricant, other.idFabricant);
    }

//Calcule un hash de l'objet
    @Override
    public int hashCode() {
        return Objects.hash(id, idCloudProvider, empreinteRadio, adresseMac, idFabricant);
    }

//Retourne une représentation sous forme de chaîne de l'ojbet IoT
    @Override
    public String toString() {
        return String.format(
                "IoTAsset{id='%s', idCloudProvider='%s', empreinteRadio='%s', adresseMac='%s', idFabricant='%s'}",
                id, idCloudProvider, empreinteRadio, adresseMac, idFabricant);
    }
}

