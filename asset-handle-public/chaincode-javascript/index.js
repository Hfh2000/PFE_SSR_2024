/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const assetTransferPublic = require('./lib/assetTransferPublic');

module.exports.AssetTransferPublic = assetTransferPublic;
module.exports.contracts = [assetTransferPublic];
