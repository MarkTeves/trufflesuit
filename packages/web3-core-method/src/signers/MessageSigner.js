/*
 This file is part of web3.js.

 web3.js is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 web3.js is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @file MessageSigner.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

"use strict";

var AbstractSigner = require('../../lib/signers/AbstractSigner');

/**
 * @constructor
 */
function MessageSigner() { }

/**
 * Signs a given message
 *
 * @method sign
 *
 * @param {String} data
 * @param {String} address
 * @param {Accounts} accounts
 *
 * @returns {String | Error}
 */
MessageSigner.prototype.sign = function(data, address, accounts) {
    var wallet = this.getWallet(address, accounts);
    if (wallet && wallet.privateKey) {
        return accounts.sign(data, wallet.privateKey).signature;
    }

    throw new Error('Wallet or privateKey in wallet is not set!');
};

// Inherit from AbstractSigner
MessageSigner.prototype = Object.create(AbstractSigner.prototype);
MessageSigner.prototype.constructor = AbstractSigner.prototype.constructor;

module.exports = MessageSigner;
