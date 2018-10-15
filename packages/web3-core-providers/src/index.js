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
 * @file index.js
 *
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

"use strict";

var version = require('../package.json').version;
var ProvidersPackageFactory = require('./factories/ProvidersPackageFactory');
var SocketProviderAdapter = require('./adapters/SocketProviderAdapter');
var HttpProviderAdapter = require('./adapters/HttpProviderAdapter');
var HttpProvider = require('./providers/HttpProvider');
var IpcProvider = require('./providers/IpcProvider');
var WebsocketProvider = require('./providers/WebsocketProvider');
var JSONRpcMapper = require('./mappers/JSONRpcMapper');
var JSONRpcResponseValidator = require('./validators/JSONRpcResponseValidator');
var BatchRequest = require('./batch-request/BatchRequest');

module.exports = {
    version: version,

    SocketProviderAdapter: SocketProviderAdapter,
    HttpProviderAdapter: HttpProviderAdapter,

    HttpProvider: HttpProvider,
    IpcProvider: IpcProvider,
    WebsocketProvider: WebsocketProvider,

    JSONRpcMapper: JSONRpcMapper,
    JSONRpcResponseValidator: JSONRpcResponseValidator,

    /**
     * Returns the Batch object
     *
     * @method createBatchRequest
     *
     * @param {AbstractProviderAdapter|EthereumProvider} provider
     *
     * @returns {BatchRequest}
     */
    createBatchRequest: function (provider) {
        return new BatchRequest(
            provider,
            JSONRpcMapper,
            new ProvidersPackageFactory().createJSONRpcResponseValidator()
        );
    },

    /**
     * Resolves the right provider adapter by the given parameters
     *
     * @method resolve
     *
     * @param {Object|String} provider
     * @param {Net} net
     *
     * @returns {AbstractProviderAdapter}
     */
    resolve: function (provider, net) {
        return new ProvidersPackageFactory().createProviderAdapterResolver().resolve(provider, net);
    },

    /**
     * Detects the given provider in the global scope
     *
     * @method detect
     *
     * @returns {Object}
     */
    detect: function () {
        return new ProvidersPackageFactory().createProviderDetector().detect();
    }
};
