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
 * @file MethodsProxy.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

"use strict";

/**
 * @param {Contract} contract
 * @param {ABIModel} abiModel
 * @param {RpcMethodFactory} rpcMethodFactory
 * @param {MethodController} methodController
 * @param {MethodEncoder} methodEncoder
 * @param {RpcMethodOptionsValidator} rpcMethodOptionsValidator
 * @param {RpcMethodOptionsMapper} rpcMethodOptionsMapper
 * @param {PromiEventPackage} promiEventPackage
 *
 * @constructor
 */
function MethodsProxy(
    contract,
    abiModel,
    rpcMethodFactory,
    methodController,
    methodEncoder,
    rpcMethodOptionsValidator,
    rpcMethodOptionsMapper,
    promiEventPackage
) {
    this.contract = contract;
    this.abiModel = abiModel;
    this.rpcMethodFactory = rpcMethodFactory;
    this.methodController = methodController;
    this.methodEncoder = methodEncoder;
    this.rpcMethodOptionsValidator = rpcMethodOptionsValidator;
    this.rpcMethodOptionsMapper = rpcMethodOptionsMapper;
    this.promiEventPackage = promiEventPackage;

    return new Proxy(this, {
        get: this.proxyHandler
    });
}

/**
 * Checks if a contract event exists by the given name and returns the subscription otherwise it throws an error
 *
 * @method proxyHandler
 *
 * @param {MethodsProxy} target
 * @param {String} name
 *
 * @returns {Function|Error}
 */
MethodsProxy.prototype.proxyHandler = function (target, name) {
    var self = this;
    var abiItemModel = this.abiModel.getMethod(name);

    if (abiItemModel) {
        var anonymousFunction = function () {
            abiItemModel.contractMethodParameters = arguments;
        };

        anonymousFunction[abiItemModel.requestType] = function () {
            return self.executeMethod(abiItemModel, target, arguments);
        };

        anonymousFunction[abiItemModel.requestType].request = function () {
            return self.createRpcMethod(abiItemModel, target, arguments);
        };

        anonymousFunction.estimateGas = function () {
            abiItemModel.requestType = 'estimate';

            return self.executeMethod(abiItemModel, target, arguments);
        };

        anonymousFunction.encodeAbi = function () {
            return self.methodEncoder.encode(abiItemModel, target.contract.options.data);
        };
    }

    throw Error('Method with name "' + name + '" not found');
};

/**
 * Executes the RPC method with the methodController
 *
 * @param {ABIItemModel} abiItemModel
 * @param {MethodsProxy} target
 * @param {IArguments} methodArguments
 *
 * @returns {Promise|PromiEvent|String|Boolean}
 */
MethodsProxy.prototype.executeMethod = function (abiItemModel, target, methodArguments) {
    var rpcMethodModel = this.createRpcMethodModel(abiItemModel, target, methodArguments);

    if (typeof rpcMethodModel.error !== 'undefined') {
        return this.handleValidationError(rpcMethodModel.error, rpcMethodModel.callback);
    }

    return this.methodController.execute(
        rpcMethodModel,
        target.contract.currentProvider,
        target.contract.accounts,
        target.contract
    );
};

/**
 * Creates the rpc method, encodes the contract method and validate the objects.
 *
 * @param {ABIItemModel|Array} abiItemModel
 * @param {MethodsProxy} target
 * @param {IArguments} methodArguments
 *
 * @returns {AbstractMethodModel}
 */
MethodsProxy.prototype.createRpcMethodModel = function (abiItemModel, target, methodArguments) {
    var rpcMethodModel, self = this;

    // If it is an array than check which AbiItemModel should be used.
    // This will be used if two methods with the same name exists but with different arguments.
    if (_.isArray(abiItemModel)) {
        var isContractMethodParametersLengthValid = false;

        // Check if one of the AbiItemModel in this array does match the arguments length
        abiItemModel.some(function(method) {
            // Get correct rpc method model
            rpcMethodModel = self.rpcMethodFactory.createRpcMethod(method);
            rpcMethodModel.methodArguments = methodArguments;
            isContractMethodParametersLengthValid = abiItemModel.givenParametersLengthIsValid();

            return isContractMethodParametersLengthValid === true;
        });

        // Return error if no AbiItemModel found with the correct arguments length
        if (isContractMethodParametersLengthValid !== true) {
            return {
                error: isContractMethodParametersLengthValid,
                callback: rpcMethodModel.callback
            };
        }
    } else {
        // Get correct rpc method model
        rpcMethodModel = this.rpcMethodFactory.createRpcMethod(abiItemModel);
        rpcMethodModel.methodArguments = methodArguments;
    }


    // Validate contract method parameters length
    var contractMethodParametersLengthIsValid = abiItemModel.givenParametersLengthIsValid();
    if (contractMethodParametersLengthIsValid instanceof Error) {
        return {
            error: contractMethodParametersLengthIsValid,
            callback: rpcMethodModel.callback
        };
    }

    // Encode contract method and check if there was an error
    var encodedContractMethod = self.methodEncoder.encode(abiItemModel, target.contract.options.data);
    if (encodedContractMethod instanceof Error) {
        return {
            error: encodedContractMethod,
            callback: rpcMethodModel.callback
        };
    }

    // Set encoded contractMethod as data property of the transaction or call
    rpcMethodModel.parameters[0]['data'] = encodedContractMethod;

    // Set default options in the TxObject if required
    rpcMethodModel.parameters = self.rpcMethodOptionsMapper.map(target.contract.options, rpcMethodModel.parameters[0]);

    // Validate TxObject
    var rpcMethodOptionsValidationResult = self.rpcMethodOptionsValidator.validate(abiItemModel, rpcMethodModel);
    if (rpcMethodOptionsValidationResult instanceof Error) {
        return {
            error: rpcMethodOptionsValidationResult,
            callback: rpcMethodModel.callback
        };
    }

    return rpcMethodModel;
};

/**
 * Creates an promiEvent and rejects it with an error
 *
 * @method handleValidationError
 *
 * @param {Error} error
 * @param {Function} callback
 *
 * @callback callback callback(error, result)
 * @returns {PromiEvent}
 */
MethodsProxy.prototype.handleValidationError = function (error, callback) {
    var promiEvent = this.promiEventPackage.createPromiEvent();

    promiEvent.resolve(null);
    promiEvent.reject(error);
    promiEvent.eventEmitter.emit('error', error);

    if (_.isFunction(callback)) {
        callback(error, null);
    }

    return promiEvent;
};

module.exports = MethodsProxy;
