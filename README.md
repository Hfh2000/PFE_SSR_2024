# PFE_SSR_2024

### Structure du dépôt

##### Le dépôt est organisé comme suit :     

- **/test-network/** : Fournit les scripts et fichiers de configuration pour configurer un réseau Hyperledger Fabric.
- **network.sh** : Script principal pour démarrer, configurer et arrêter un réseau Hyperledger Fabric. 
- **setup.sh** : Script pour automatiser la configuration du réseau, créer les channels et déployer les smart contracts.
- **/bin/** : Répertoire contenant les exécutables et outils nécessaires au fonctionnement d’Hyperledger Fabric
- **/config/** : Dossier de configuration où sont stockés les fichiers essentiels pour paramétrer Fabric.
- **/asset-transfer-basic/**
  - **/chaincode-javascript/** : Répertoire contenant le code source et les dépendances du Smart Contract du private channel développé en JavaScript
    - **lib/assetTransfer.js**: Code principal du Smart Contract, implémentant les transactions sur la blockchain.
    - **index.js** : Point d’entrée du Smart Contract.
- **/asset-handle-public/**
  - **/chaincode-javascript/** : Répertoire contenant le code source et les dépendances du Smart Contract du public channel développé en JavaScript
    - **lib/assetTransferPublic.js** : Code principal du Smart Contract, implémentant les transactions sur la blockchain.
    - **index.js** : Point d’entrée du Smart Contract.
- **README.md** : Guide utilisateur pour démarrer avec le projet.


### Installation et Configuration

#### Pré-requis
Assurez-vous que les outils suivants sont installés sur votre machine :
- Git
- cURL 
- Docker et Docker Compose
- JQ
- nvm et Node.js 18 ou supérieur
- npm 8 ou supérieur

#### Configuration initiale 

Après avoir cloné notre dépôt git via https://github.com/farahhas/PFE_SSR_2024 et une fois l'installation terminée, démarrez le réseau Hyperledger Fabric en vous plaçant dans le répertoire PFE_SSR_2024. Le processus de configuration du réseau peut être simplifié grâce à un script permettant d’automatiser la création de notre projet. Ce script automatise en effet  la création de nos channels, l’enregistrement de nos acteurs (enquêteurs, juges, etc.), le déploiement des autorités de certification (CA), et l'installation des smart contracts sur nos channels. Les commandes réalisées par le script sont décrites dans la partie 4.3. 

Placez vous à la racine du dépôt et exécutez donc la commande  source setup.sh 

Pour vérifier que tout a été correctement configuré et testé notre réseau et nos smart contract implémentés, vous pouvez ainsi :
- Lister les channels :  `peer channel list`
- Interroger un smart contract : 
  - Voir les objets IoT enregistrés sur le private channel: `peer chaincode query -C private-channel-juge-fabricant -n basic -c '{"Args":["queryAll"]}'`
  - Voir les hashs des empreintes radio et adresse MAC des objets IoT dans le public channel : `peer chaincode query -C public-channel -n public -c '{"Args":["GetAllAssets"]}'`
  - Rechercher un objet IoT par son empreinte radio dans le private channel: `peer chaincode query -C private-channel-juge-fabricant -n basic -c '{"Args":["ReadAssetByEmpreinte", "empreinte1"]}'`
  - Rechercher un objet IoT par son adresse MAC dans le private channel: `peer chaincode query -C private-channel-juge-fabricant -n basic -c '{"Args":["ReadAssetByMac", "00:0a:95:9d:68:16"]}'`
  - Vérifier si une empreinte radio est enregistrée par son hash dans le public channel: `peer chaincode query -C public-channel -n public -c '{"Args":["VerifyAssetHash", "empreinte1"]}'`
  - Vérifier si adresse MAC est enregistrée par son hash dans le public channel: `peer chaincode query -C public-channel -n public -c '{"Args":["VerifyAssetHash", "00:0a:95:9d:68:16"]}'`
- Ecrire dans un smart contract : 

  - Ajouter un nouvel objet IoT dans le private channel : `peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C private-channel-juge-fabricant -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"CreateAsset","Args":["SN-5", "cloud_provider_1", "empreinte-radio-5678", "00:0a:95:9d:68:25", "fabricant_1"]}'`

  - Ajouter un nouvel hash d’une empreinte radio d’une objet IoT dans le private channel : `peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls \ --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \ -C public-channel -n public \ --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \ --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \ -c '{"function":"StoreAssetHash","Args":["empreinte-radio-9999"]}'`

  - Ajouter un nouvel hash d’une adresse MAC d’une objet IoT dans le private channel : `peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls \ --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \ -C public-channel -n public \ --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \ --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \ -c '{"function":"StoreAssetHash","Args":["00:0a:95:9d:68:99"]}'`

-Vérifier les identités enregistrées : Dans les répertoires de la CA . 
