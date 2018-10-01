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
 * @file EventOptionsMapper.js
 * @author Samuel Furter <samuel@ethereum.org>
 * @date 2018
 */

"use strict";

/**
 * @param {Object} formatters
 * @param {EventFilterEncoder} eventFilterEncoder
 *
 * @constructor
 */
function EventOptionsMapper(formatters, eventFilterEncoder) {
    this.formatters = formatters;
    this.eventFilterEncoder = eventFilterEncoder;
}

/**
 * @param {ABIItemModel} abiItemModel
 * @param {Contract} contract
 * @param {Object} options
 *
 * @returns {Object}
 */
EventOptionsMapper.prototype.map = function(abiItemModel, contract, options) {
    var topics = [];

    if (typeof options.fromBlock !== 'undefined') {
        options.fromBlock = this.formatters.inputBlockNumberFormatter(options.fromBlock);
    }

    if (typeof options.toBlock !== 'undefined') {
        options.toBlock = this.formatters.inputBlockNumberFormatter(options.toBlock);
    }

    if (!event.anonymous) {
        topics.push(event.signature);
    }

    if (typeof options.filter !== 'undefined') {
       topics.concat(this.eventFilterEncoder.encode(abiItemModel, options.filter));
    }

    options.address = contract.options.address;

    return options;
};

module.exports = EventOptionsMapper;
