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
 * @file GetAccountsMethodModel.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

"use strict";

var AbstractMethodModel = require('../../../../lib/models/AbstractMethodModel');

/**
 * @param {Object} utils
 * @param {Object} formatters
 *
 * @constructor
 */
function GetAccountsMethodModel(utils, formatters) {
    AbstractMethodModel.call(this, 'eth_accounts', 0, utils, formatters);
}

GetAccountsMethodModel.prototype = Object.create(AbstractMethodModel.prototype);
GetAccountsMethodModel.prototype.constructor = GetAccountsMethodModel;

/**
 * This method will be executed after the RPC request.
 *
 * @method afterExecution
 *
 * @param {Object} response
 *
 * @returns {Array}
 */
GetAccountsMethodModel.prototype.afterExecution = function (response) {
    var self = this;

    return response.map(function(responseItem) {
        return self.utils.toChecksumAddress(responseItem);
    });
};

module.exports = GetAccountsMethodModel;
