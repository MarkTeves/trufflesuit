var chai = require('chai');
var bloom = require('../packages/web3-utils/src/BloomFilter.js');
var assert = chai.assert;

var topicTests = [
    {
        bloom:
            '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
        result: false
    },
    {
        bloom:
            '0x0020008400000010000000000400000200000008000000000010000000002000000080000020000000080004000000010000000000000040000000000000000000000001000200008000000d000000000010000400000400000100000000000001400008220000000000004000040802004000200000000000000010000041000000020100008000000000000000000000000010000000080000000000800900000000000000000000000000100000800000000000000c28000000000000010000000002000040002000000080000000000000000000000020120020000020200000000040000000000000040000000400000000000000000000020000000000',
        topics: [
            '0xDDF252AD1BE2C89B69C2B068FC378DAA952BA7F163C4A11628F55A4DF523B3EF',
            '0x000000000000000000000000b3bb037d2f2341a1c2775d51909a3d944597987d',
            '0x00000000000000000000000041f106fe815079086c73e24c5da97a4afec1c8c3'
        ],
        result: true
    },
    {
        bloom:
            '0x0020008400000010000000000400000200000008000000000010000000002000000080000020000000080004000000010000000000000040000000000000000000000001000200008000000d000000000010000400000400000100000000000001400008220000000000004000040802004000200000000000000010000041000000020100008000000000000000000000000010000000080000000000800900000000000000000000000000100000800000000000000c28000000000000010000000002000040002000000080000000000000000000000020120020000020200000000040000000000000040000000400000000000000000000020000000000',
        topics: ['0x00000000000000000000000041f106fe815079086c73e24c5da97a4afec1c8c4'],
        result: false
    }
];

describe('web3-utils/bloomFilter', function() {
    describe('hasTopic', function() {
        topicTests.forEach(function(test) {
            test.topics.forEach(function(topic) {
                assert.equal(bloom.testTopic(test.bloom, topic), test.result);
            });
        });
    });
});
