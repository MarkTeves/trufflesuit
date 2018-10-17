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
 * @file Contract.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

"use strict";

import {AbstractWeb3Module} from 'web3-core';

export default class Contract extends AbstractWeb3Module {

    /**
     * @param {AbstractProviderAdapter|EthereumProvider} provider
     * @param {ProvidersPackage} providersPackage
     * @param {MethodController} methodController
     * @param {ContractPackageFactory} contractPackageFactory
     * @param {PromiEventPackage} promiEventPackage
     * @param {ABICoder} abiCoder
     * @param {Object} utils
     * @param {Object} formatters
     * @param {Accounts} accounts
     * @param {ABIMapper} abiMapper
     * @param {Object} abi
     * @param {String} address
     * @param {Object} options
     *
     * @constructor
     */
    constructor(
        provider,
        providersPackage,
        methodController,
        contractPackageFactory,
        promiEventPackage,
        abiCoder,
        utils,
        formatters,
        accounts,
        abiMapper,
        abi,
        address,
        options
    ) {
        super(provider, providersPackage, null, null);

        if (!(this instanceof Contract)) {
            throw new Error('Please use the "new" keyword to instantiate a web3.eth.contract() object!');
        }

        if (!abi || !(Array.isArray(abi))) {
            throw new Error('You must provide the json interface of the contract when instantiating a contract object.');
        }

        this.providersPackage = providersPackage;
        this.methodController = methodController;
        this.contractPackageFactory = contractPackageFactory;
        this.abiCoder = abiCoder;
        this.utils = utils;
        this.formatters = formatters;
        this.accounts = accounts;
        this.abiMapper = abiMapper;
        this.options = options;
        this.promiEventPackage = promiEventPackage;
        this.rpcMethodModelFactory = contractPackageFactory.createRpcMethodModelFactory();


        this.defaultBlock = 'latest';
        address = this.utils.toChecksumAddress(this.formatters.inputAddressFormatter(address));

        let abiModel = abiMapper.map(abi);
        let defaultAccount = null;

        /**
         * Defines accessors for contract address
         */
        Object.defineProperty(this.options, 'address', {
            set: (value) => {
                if (value) {
                    address = this.utils.toChecksumAddress(this.formatters.inputAddressFormatter(value));
                }
            },
            get: () => {
                return address;
            },
            enumerable: true
        });

        /**
         * Defines accessors for jsonInterface
         */
        Object.defineProperty(this.options, 'jsonInterface', {
            set: (value) => {
                abiModel = this.abiMapper.map(value);
                this.methods.abiModel = abiModel;
                this.events.abiModel = abiModel;
            },
            get: () => {
                return abiModel;
            },
            enumerable: true
        });

        /**
         * Defines accessors for defaultAccount
         */
        Object.defineProperty(this, 'defaultAccount', {
            get: () => {
                if (!defaultAccount) {
                    return this.options.from;
                }

                return defaultAccount;
            },
            set: (val) => {
                if (val) {
                    defaultAccount = this.utils.toChecksumAddress(this.formatters.inputAddressFormatter(val));
                }

            },
            enumerable: true
        });

        this.methods = contractPackageFactory.createMethodsProxy(
            this,
            abiModel,
            this.methodController,
            this.promiEventPackage
        );

        this.events = contractPackageFactory.createEventSubscriptionsProxy(
            this,
            abiModel,
            this.methodController
        );
    }

    /**
     * Adds event listeners and creates a subscription, and remove it once its fired.
     *
     * @method once
     *
     * @param {String} eventName
     * @param {Object} options
     * @param {Function} callback
     *
     * @callback callback callback(error, result)
     * @returns {undefined}
     */
    once(eventName, options, callback) {
        if (!callback) {
            throw new Error('Once requires a callback function.');
        }

        if (options) {
            delete options.fromBlock;
        }

        const eventSubscription = this.events[event](options, callback);

        eventSubscription.on('data', () => {
            eventSubscription.unsubscribe();
        });
    }

    /**
     * Returns the past event logs by his name
     *
     * @method getPastEvents
     *
     * @param {String} eventName
     * @param {Object} options
     * @param {Function} callback
     *
     * @callback callback callback(error, result)
     * @returns {Promise<Array>}
     */
    getPastEvents(eventName, options, callback) {
        if (!this.options.jsonInterface.hasEvent(eventName)) {
            throw Error(`Event with name "${eventName}does not exists.`);
        }

        const pastEventLogsMethodModel = this.rpcMethodModelFactory.createPastEventLogsMethodModel(
            this.options.jsonInterface.getEvent(eventName)
        );

        pastEventLogsMethodModel.parameters = [options];
        pastEventLogsMethodModel.callback = callback;

        return this.methodController.execute(
            pastEventLogsMethodModel,
            this.accounts,
            this
        );
    }

    /**
     * Deploy an contract and returns an new Contract instance with the correct address set
     *
     * @method deploy
     *
     * @param {Object} options
     *
     * @returns {Promise<Contract>|EventEmitter}
     */
    deploy(options) {
        return this.methods.contractConstructor(options);
    }

    /**
     * Return an new instance of the Contract object
     *
     * @method clone
     *
     * @returns {Contract}
     */
    clone() {
        return new this.constructor(
            this.currentProvider,
            this.providersPackage,
            this.methodController,
            this.contractPackageFactory,
            this.promiEventPackage,
            this.abiCoder,
            this.utils,
            this.formatters,
            this.accounts,
            this.abiMapper,
            this.options.jsonInterface,
            this.options.address,
            this.options
        );
    }

    /**
     * Sets the currentProvider and provider property
     *
     * @method setProvider
     *
     * @param {Object|String} provider
     * @param {Net} net
     *
     * @returns {Boolean}
     */
    setProvider(provider, net) {
        return !!(
            AbstractWeb3Module.prototype.setProvider.call(this, provider, net) &&
            this.accounts.setProvider(provider, net)
        );
    }
}
