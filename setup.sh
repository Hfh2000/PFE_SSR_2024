#!/bin/bash

echo "Arrêt du réseau Hyperledger Fabric..."
cd test-network
./network.sh down

echo "Démarrage du réseau Fabric avec les CAs..."
./network.sh up -ca

echo "Vérification des conteneurs en cours..."
docker ps

echo "Vérification des MSP générés..."
tree organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/
tree organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/

echo "Création des canaux..."
./network.sh createChannel -c public-channel
./network.sh createChannel -c private-channel-juge-fabricant

echo "Configuration des variables d'environnement pour Org1..."
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

echo "Vérification des canaux pour Org1..."
peer channel list

echo "Configuration des variables d'environnement pour Org2..."
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

echo "Vérification des canaux pour Org2..."
peer channel list

echo "Configuration des identités Fabric CA pour Org1..."
export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/org1.example.com/
export FABRIC_CA_CLIENT_TLS_CERTFILES=${PWD}/organizations/fabric-ca/org1/tls-cert.pem

fabric-ca-client register --id.name fabricant1 --id.secret fabricant1 --id.type client --tls.certfiles ${FABRIC_CA_CLIENT_TLS_CERTFILES}
fabric-ca-client enroll -u https://fabricant1:fabricant1@localhost:7054 --tls.certfiles ${FABRIC_CA_CLIENT_TLS_CERTFILES} -M ${PWD}/wallet/fabricant1

echo "Vérification des certificats du Fabricant..."
tree wallet/fabricant1

echo "Configuration des identités Fabric CA pour Org2..."
export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/org2.example.com/
export FABRIC_CA_CLIENT_TLS_CERTFILES=${PWD}/organizations/fabric-ca/org2/tls-cert.pem

fabric-ca-client register --id.name juge1 --id.secret juge1 --id.type client --tls.certfiles ${FABRIC_CA_CLIENT_TLS_CERTFILES}
fabric-ca-client enroll -u https://juge1:juge1@localhost:8054 --tls.certfiles ${FABRIC_CA_CLIENT_TLS_CERTFILES} -M ${PWD}/wallet/juge1

echo "Vérification des certificats du Juge..."
tree wallet/juge1

echo "Reconfiguration des variables d’environnement pour utiliser la CA d’Org1..."
export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/org1.example.com/
export FABRIC_CA_CLIENT_TLS_CERTFILES=${PWD}/organizations/fabric-ca/org1/tls-cert.pem

echo "Liste des identités enregistrées dans la CA d'Org1..."
fabric-ca-client identity list -u https://localhost:7054 --tls.certfiles ${PWD}/organizations/fabric-ca/org1/tls-cert.pem

echo "Reconfiguration des variables d’environnement pour utiliser la CA d’Org2..."
export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/org2.example.com/
export FABRIC_CA_CLIENT_TLS_CERTFILES=${PWD}/organizations/fabric-ca/org2/tls-cert.pem

echo "Liste des identités enregistrées dans la CA d'Org2..."
fabric-ca-client identity list -u https://localhost:8054 --tls.certfiles ${PWD}/organizations/fabric-ca/org2/tls-cert.pem

echo "Compilation et empaquetage du Smart Contract..."
cd ../asset-transfer-basic/chaincode-javascript
npm install
cd ../../test-network

echo "Installation et approbation du Chaincode"
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
peer version
peer lifecycle chaincode package basic.tar.gz --path ../asset-transfer-basic/chaincode-javascript/ --lang node --label basic_1.0

echo "Installation du chaincode sur Org1"
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
peer lifecycle chaincode install basic.tar.gz

echo "Installation du chaincode sur Org2"
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051
peer lifecycle chaincode install basic.tar.gz

echo "Vérification des installations du chaincode"
peer lifecycle chaincode queryinstalled

echo "Récupération de l'identifiant du package de chaincode"
export CC_PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep "basic_1.0:" | awk '{print $3}' | sed 's/,//g')

echo "Approbation du chaincode par Org2"
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID private-channel-juge-fabricant --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

echo "Approbation du chaincode par Org1"
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_ADDRESS=localhost:7051
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID private-channel-juge-fabricant --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

echo "Vérification de l'état d'approbation"
peer lifecycle chaincode checkcommitreadiness --channelID private-channel-juge-fabricant --name basic --version 1.0 --sequence 1 --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" --output json

echo "Engagement du chaincode sur le canal"
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID private-channel-juge-fabricant --name basic --version 1.0 --sequence 1 --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"

echo "Vérification de l'engagement du chaincode"
peer lifecycle chaincode querycommitted --channelID private-channel-juge-fabricant --name basic --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

echo "Initialisation du ledger"
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C private-channel-juge-fabricant -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}'

echo "Vérification des actifs enregistrés"
sleep 3
peer chaincode query -C private-channel-juge-fabricant -n basic -c '{"Args":["GetAllAssets"]}'


