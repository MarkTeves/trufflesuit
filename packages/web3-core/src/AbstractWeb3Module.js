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
 * @file AbstractWeb3Module.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

import {isArray, isObject} from 'underscore';
import {AbstractMethodModel} from 'web3-core-method';

export default class AbstractWeb3Module {
    /**
     * @param {AbstractProviderAdapter|EthereumProvider} provider
     * @param {ProvidersModuleFactory} providersModuleFactory
     * @param {Object} providers
     * @param {MethodController} methodController
     * @param {AbstractMethodModelFactory} methodModelFactory
     * @param {Object} options
     *
     * @constructor
     */
    constructor(
        provider = this.throwIfMissing('provider'),
        providersModuleFactory = this.throwIfMissing('providersModuleFactory'),
        providers = this.throwIfMissing('providers'),
        methodController = this.throwIfMissing('methodController'),
        methodModelFactory = null,
        options = {}
    ) {
        this._currentProvider = provider;
        this.providersModuleFactory = providersModuleFactory;
        this.providers = providers;
        this.methodController = methodController;
        this.providerDetector = providersModuleFactory.createProviderDetector();
        this.providerAdapterResolver = providersModuleFactory.createProviderAdapterResolver();
        this._defaultAccount = options.defaultAccount || null;
        this._defaultBlock = options.defaultBlock || null;
        this._transactionBlockTimeout = options.timeoutBlock || 50;
        this._transactionConfirmationBlocks = options.confirmationBlock || 24;
        this._transactionPollingTimeout = options.pollingTimeout || 15;
        this._defaultGasPrice = options.defaultGasPrice || null;
        this._defaultGas = options.defaultGas || null;
        this.extendedPackages = [];
        this.givenProvider = this.providerDetector.detect();
        this.BatchRequest = () => {
            return this.providersModuleFactory.createBatchRequest(this.currentProvider);
        };

        if (methodModelFactory !== null && typeof methodModelFactory !== 'undefined') {
            this.methodModelFactory = methodModelFactory;
            this.extend.formatters = this.methodModelFactory.formatters;

            return new Proxy(this, {
                get: this.proxyHandler
            });
        }
    }

    /**
     * Getter for the defaultGasPrice property
     *
     * @property defaultGasPrice
     *
     * @returns {String}
     */
    get defaultGasPrice() {
        return this._defaultGasPrice;
    }

    /**
     * Sets the defaultGasPrice property on the current object and his extended objects
     *
     * @property defaultGasPrice
     *
     * @param {String} value
     */
    set defaultGasPrice(value) {
        this._defaultGasPrice = value;
        if (this.extendedPackages.length > 0) {
            this.extendedPackages.forEach((extendedPackage) => {
                extendedPackage.defaultGasPrice = value;
            });
        }
    }

    /**
     * Sets the defaultGas property on the current object and his extended objects
     *
     * @property defaultGas
     *
     * @param {Number} value
     */
    set defaultGas(value) {
        this._defaultGas = value;
        if (this.extendedPackages.length > 0) {
            this.extendedPackages.forEach((extendedPackage) => {
                extendedPackage.defaultGas = value;
            });
        }
    }

    /**
     * Getter for the defaultGas property
     *
     * @property defaultGas
     *
     * @returns {Number}
     */
    get defaultGas() {
        return this._defaultGas;
    }

    /**
     * Getter for the pollingTimeout property
     *
     * @property transactionPollingTimeout
     *
     * @returns {Number}
     */
    get transactionPollingTimeout() {
        return this._transactionPollingTimeout;
    }

    /**
     * Sets the pollingTimeout for the current object and his extended objects
     *
     * @property transactionPollingTimeout
     *
     * @param {Number} value
     */
    set transactionPollingTimeout(value) {
        this._transactionPollingTimeout = value;
        if (this.extendedPackages.length > 0) {
            this.extendedPackages.forEach((extendedPackage) => {
                extendedPackage._transactionPollingTimeout = value;
            });
        }
    }

    /**
     * Getter for the confirmationBlock property
     *
     * @property transactionConfirmationBlocks
     *
     * @returns {Number}
     */
    get transactionConfirmationBlocks() {
        return this._transactionConfirmationBlocks;
    }

    /**
     * Sets the confirmationBlock on the current object and his extended objects
     *
     * @property transactionConfirmationBlocks
     *
     * @param {Number} value
     */
    set transactionConfirmationBlocks(value) {
        this._transactionConfirmationBlocks = value;
        if (this.extendedPackages.length > 0) {
            this.extendedPackages.forEach((extendedPackage) => {
                extendedPackage._transactionConfirmationBlocks = value;
            });
        }
    }

    /**
     * Getter for the timeoutBlock property
     *
     * @property transactionBlockTimeout
     *
     * @returns {Number}
     */
    get transactionBlockTimeout() {
        return this._transactionBlockTimeout;
    }

    /**
     * Sets the timeoutBlock property on the current object and his extended objects
     *
     * @property transactionBlockTimeout
     *
     * @param {Number} value
     */
    set transactionBlockTimeout(value) {
        this._transactionBlockTimeout = value;
        if (this.extendedPackages.length > 0) {
            this.extendedPackages.forEach((extendedPackage) => {
                extendedPackage._transactionBlockTimeout = value;
            });
        }
    }

    /**
     * Getter for the defaultBlock property
     *
     * @returns {String|Number}
     */
    get defaultBlock() {
        return this._defaultBlock;
    }

    /**
     * Sets the defaultBlock on the current object and his extended objects
     *
     * @property defaultBlock
     *
     * @param {String|Number} value
     */
    set defaultBlock(value) {
        this._defaultBlock = value;
        if (this.extendedPackages.length > 0) {
            this.extendedPackages.forEach((extendedPackage) => {
                extendedPackage.defaultBlock = value;
            });
        }
    }

    /**
     * Getter for the defaultAccount property
     *
     * @property defaultAccount
     *
     * @returns {null|String}
     */
    get defaultAccount() {
        return this._defaultAccount;
    }

    /**
     * Sets the defaultAccount of the current object and extended objects
     *
     * @property defaultAccount
     *
     * @param {String} value
     */
    set defaultAccount(value) {
        this._defaultAccount = this.utils.toChecksumAddress(this.formatters.inputAddressFormatter(value));
        if (this.extendedPackages.length > 0) {
            this.extendedPackages.forEach((extendedPackage) => {
                extendedPackage.defaultAccount = value;
            });
        }
    }

    /**
     * Returns the currentProvider
     *
     * @property currentProvider
     *
     * @returns {AbstractProviderAdapter|EthereumProvider}
     */
    get currentProvider() {
        return this._currentProvider;
    }

    /**
     * Throws an error because currentProvider is read-only
     *
     * @property currentProvider
     */
    set currentProvider(value) {
        throw new Error('The property currentProvider is read-only!');
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
        if (!this.isSameProvider(provider)) {
            this.clearSubscriptions();
            this._currentProvider = this.providerAdapterResolver.resolve(provider, net);

            var setExtendedPackagesProvider = true;
            if (this.extendedPackages.length > 0) {
                setExtendedPackagesProvider = this.extendedPackages.every((extendedPackage) => {
                    return extendedPackage.setProvider(provider, net);
                });
            }

            return !!(setExtendedPackagesProvider && this._currentProvider);
        }

        return false;
    }

    /**
     * Checks if the given provider is the same as the currentProvider
     *
     * @method isSameProvider
     *
     * @param {Object|String} provider
     *
     * @returns {Boolean}
     */
    isSameProvider(provider) {
        if (isObject(provider)) {
            if (this.currentProvider.provider.constructor.name === provider.constructor.name) {
                return this.currentProvider.host === provider.host;
            }

            return false;
        }

        return this.currentProvider.host === provider;
    }

    /**
     * Clears all subscriptions and listeners of the provider if it has any subscriptions
     *
     * @method clearSubscriptions
     */
    clearSubscriptions() {
        if (
            typeof this.currentProvider.clearSubscriptions !== 'undefined' &&
            this.currentProvider.subscriptions.length > 0
        ) {
            this.currentProvider.clearSubscriptions();
        }
    }

    /**
     * Extends the current object with JSON-RPC methods
     *
     * @method extend
     *
     * @param {Object} extension
     */
    extend(extension) {
        const namespace = extension.property || false;
        let object;

        if (namespace) {
            let methodModelFactory = null;

            if (this.methodModelFactory !== null) {
                methodModelFactory = new this.methodModelFactory.constructor(
                    {},
                    this.methodModelFactory.utils,
                    this.methodModelFactory.formatters
                );
            }

            object = this[namespace] = new this.constructor(
                this.currentProvider,
                this.providersModuleFactory,
                this.providers,
                this.methodController,
                methodModelFactory,
                this.defaultAccount,
                this.defaultBlock,
                this.timeoutBlock,
                this.confirmationBlock,
                this.pollingTimeout
            );

            this.extendedPackages.push(object);
        } else {
            object = this;
        }

        if (extension.methods) {
            extension.methods.forEach((method) => {
                class ExtensionMethodModel extends AbstractMethodModel {
                    constructor(utils, formatters) {
                        super(method.call, method.params, utils, formatters);
                    }

                    beforeExecution(parameters, moduleInstance) {
                        method.inputFormatters.forEach((formatter, key) => {
                            if (formatter) {
                                parameters[key] = formatter(parameters[key], moduleInstance);
                            }
                        });
                    }

                    afterExecution(response) {
                        if (isArray(response)) {
                            response = response.map((responseItem) => {
                                if (method.outputFormatter && responseItem) {
                                    return method.outputFormatter(responseItem);
                                }

                                return responseItem;
                            });

                            return response;
                        }

                        if (method.outputFormatter && response) {
                            response = method.outputFormatter(response);
                        }

                        return response;
                    }
                }

                object.methodModelFactory.methodModels[method.name] = ExtensionMethodModel;
            });
        }
    }

    /**
     * Handles method execution
     *
     * @method proxyHandler
     *
     * @param {Object} target
     * @param {String} name
     *
     * @returns {*}
     */
    proxyHandler(target, name) {
        if (target.methodModelFactory.hasMethodModel(name)) {
            if (typeof target[name] !== 'undefined') {
                throw new TypeError(
                    `Duplicated method ${name}. This method is defined as RPC call and as Object method.`
                );
            }

            const methodModel = target.methodModelFactory.createMethodModel(name);

            const anonymousFunction = () => {
                methodModel.methodArguments = arguments;

                if (methodModel.parameters.length !== methodModel.parametersAmount) {
                    throw new Error(
                        `Invalid parameters length the expected length would be 
                        ${methodModel.parametersAmount}
                         and not 
                        ${methodModel.parameters.length}`
                    );
                }

                return target.methodController.execute(methodModel, target.accounts, target);
            };

            anonymousFunction.methodModel = methodModel;
            anonymousFunction.request = methodModel.request;

            return anonymousFunction;
        }

        return target[name];
    }

    /**
     * Throws an error if the parameter is missing
     *
     * @param {String} name
     */
    throwIfMissing(name) {
        throw new Error(`Parameter with name ${name} is missing`);
    }
}
