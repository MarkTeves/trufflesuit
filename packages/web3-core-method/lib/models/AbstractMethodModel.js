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
 * @file AbstractMethodModel.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

"use strict";

var _ = require('underscore');

/**
 * @param {String|Function} rpcMethod
 * @param {Number} parametersAmount
 * @param {Object} utils
 * @param {Object} formatters
 *
 * @constructor
 */
function AbstractMethodModel(rpcMethod, parametersAmount, utils, formatters) {
    this.rpcMethod = rpcMethod;
    this.parametersAmount = parametersAmount;
    this.utils = utils;
    this.formatters = formatters;
    var methodArguments = {};

    /**
     * Defines accessors for defaultAccount
     */
    Object.defineProperty(this, 'methodArguments', {
        get: function () {
            return methodArguments;
        },
        set: function (methodArguments) {
            methodArguments = this.mapFunctionArguments(methodArguments);
        },
        enumerable: true
    });

    this.parameters = this.methodArguments.parameters;
    this.callback = this.methodArguments.callback;
}

/**
 * This method will be executed before the RPC request.
 *
 * @method beforeExecution
 *
 * @param {AbstractWeb3Module} moduleInstance - The package where the method is called from for example Eth.
 */
AbstractMethodModel.prototype.beforeExecution = function(moduleInstance) { };

/**
 * This method will be executed after the RPC request.
 *
 * @method afterExecution
 *
 * @param {*} response
 *
 * @returns {*}
 */
AbstractMethodModel.prototype.afterExecution = function(response) {
    return response;
};

/**
 * Returns the given function arguments and the current model
 *
 * @method request
 *
 * @returns {AbstractMethodModel}
 */
AbstractMethodModel.prototype.request = function () {
    this.methodArguments = arguments;

    return this;
};

/**
 * Splits the parameters and the callback function and returns it as object
 *
 * @method mapFunctionArguments
 *
 * @param {Array} args
 *
 * @returns {Object}
 */
AbstractMethodModel.prototype.mapFunctionArguments = function (args) {
    var parameters = args,
        callback = false;

    if (args.length < this.parametersAmount) {
        throw new Error(
            'Arguments length is not correct: expected: ' + this.parametersAmount + ', given: ' + args.length
        );
    }

    if (args.length > this.parametersAmount) {
        callback = args.slice(-1);
        if(!_.isFunction(callback)) {
            throw new Error(
                'The latest parameter should be a function otherwise it can not be used as callback'
            );
        }
        parameters = args.slice(0, -1);
    }

    return {
        callback: callback,
        parameters: parameters
    }
};

/**
 * Checks if the JSON-RPC method is sign.
 *
 * @method isSign
 *
 * @returns {Boolean}
 */
AbstractMethodModel.prototype.isSign = function () {
    return this.rpcMethod === 'eth_sign';
};

/**
 * Checks if the JSON-RPC method is sendTransaction
 *
 * @method isSendTransaction
 *
 * @returns {Boolean}
 */
AbstractMethodModel.prototype.isSendTransaction = function () {
    return this.rpcMethod === 'eth_sendTransaction';
};

/**
 * Checks if the JSON-RPC method is sendRawTransaction
 *
 * @method isSendRawTransaction
 *
 * @returns {Boolean}
 */
AbstractMethodModel.prototype.isSendRawTransaction = function () {
    return this.rpcMethod === 'eth_sendRawTransaction';
};

/**
 * Checks if the given parameter is of type hash
 *
 * @method isHash
 *
 * @param {*} parameter
 *
 * @returns {Boolean}
 */
AbstractMethodModel.prototype.isHash = function (parameter) {
    return _.isString(parameter) && parameter.indexOf('0x') === 0;
};

module.exports = AbstractMethodModel;
