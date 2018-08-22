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
 * @file SocketProviderAdapter.js
 * @authors: Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

"use strict";

function SocketProviderAdapter(provider) {
    AbstractProviderAdapter.call(provider);
    this.subscriptions = [];
    this.registerSubscriptionListener();
}

/**
 * @param {string} subscriptionType
 * @param {Array} parameters
 * @returns {Promise<string|Error>}
 */
SocketProviderAdapter.prototype.subscribe = function (subscriptionType, parameters) {
    return this.send('eth_subscribe', parameters.unshift(subscriptionType)).then(function (error, subscriptionId) {
        if (!error) {
            this.subscriptions[subscriptionId]({subscriptionType: subscriptionType, type: 'eth'});

            return subscriptionId;
        }

        throw new Error('SUB ERROR');
    });
};

/**
 * @param {string} subscriptionId
 * @returns {Promise<Boolean|Error>}
 */
SocketProviderAdapter.prototype.unsubscribe = function (subscriptionId) {
    return this.send('eth_unsubscribe', [subscriptionId]).then(function (result) {
        if (result) {
            this.subscriptions = this.subscriptions.filter(function (subscription) {
                return subscription !== subscriptionId;
            });

            return true;
        }

        return false;
    });
};

/**
 * Emits an event with the subscription id
 */
SocketProviderAdapter.prototype.registerSubscriptionListener = function () {
    var self = this;
    this.provider.on('data', function (result, deprecatedResult) {
        result = result || deprecatedResult; // this is for possible old providers, which may had the error first handler

        // check for result.method, to prevent old providers errors to pass as result
        if (result.method && self.subscriptions[result.params.subscription]) {
            self.emit(result.params.subscription, result.params.result);
        }
    });
};

/**
 * @param {boolean} keepIsSyncing
 */
SocketProviderAdapter.prototype.clearSubscriptions = function (keepIsSyncing) {
    var self = this;
    var unsubscribePromises = [];

    Object.keys(this.subscriptions).forEach(function (subscriptionId) {
        if (!keepIsSyncing || self.subscriptions[subscriptionId].name !== 'syncing') {
            unsubscribePromises.push(self.unsubscribe(subscriptionId));
        }
    });

    Promise.all(unsubscribePromises).then(function () {
        this.provider.reset();
    });
};

/**
 * @returns {boolean}
 */
SocketProviderAdapter.prototype.isConnected = function () {
    return this.provider.connected;
};

SocketProviderAdapter.prototype = Object.create(AbstractProviderAdapter.prototype);

module.exports = SocketProviderAdapter;
