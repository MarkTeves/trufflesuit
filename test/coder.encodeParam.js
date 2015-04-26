var chai = require('chai');
var assert = chai.assert;
var coder = require('../lib/solidity/coder');


describe('lib/solidity/coder', function () {
    describe('encodeParam', function () {
        var test = function (t) {
            it('should turn ' + t.value + ' to ' + t.expected, function () {
                assert.equal(coder.encodeParam(t.type, t.value), t.expected);
            });
        };


        test({ type: 'int', value: 1,               expected: '0000000000000000000000000000000000000000000000000000000000000001'});
        test({ type: 'int', value: 16,              expected: '0000000000000000000000000000000000000000000000000000000000000010'});
        test({ type: 'int', value: -1,              expected: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'});
        test({ type: 'int256', value: 1,            expected: '0000000000000000000000000000000000000000000000000000000000000001'});
        test({ type: 'int256', value: 16,           expected: '0000000000000000000000000000000000000000000000000000000000000010'});
        test({ type: 'int256', value: -1,           expected: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'});
        test({ type: 'bytes32', value: 'gavofyork', expected: '6761766f66796f726b0000000000000000000000000000000000000000000000'});
        test({ type: 'bytes', value: 'gavofyork',   expected: '0000000000000000000000000000000000000000000000000000000000000009' +
                                                              '6761766f66796f726b0000000000000000000000000000000000000000000000'});
        test({ type: 'int[]', value: [3],           expected: '0000000000000000000000000000000000000000000000000000000000000001' +
                                                              '0000000000000000000000000000000000000000000000000000000000000003'});
        test({ type: 'int256[]', value: [3],        expected: '0000000000000000000000000000000000000000000000000000000000000001' +
                                                              '0000000000000000000000000000000000000000000000000000000000000003'});
        test({ type: 'int[]', value: [1,2,3],       expected: '0000000000000000000000000000000000000000000000000000000000000003' +
                                                              '0000000000000000000000000000000000000000000000000000000000000001' +
                                                              '0000000000000000000000000000000000000000000000000000000000000002' +
                                                              '0000000000000000000000000000000000000000000000000000000000000003'});
    });
});


describe('lib/solidity/coder', function () {
    describe('encodeParams', function () {
        var test = function (t) {
            it('should turn ' + t.value + ' to ' + t.expected, function () {
                assert.equal(coder.encodeParams(t.types, t.values), t.expected);
            });
        };

         
        test({ types: ['int'], values: [1],                 expected: '0000000000000000000000000000000000000000000000000000000000000001'});
        test({ types: ['int'], values: [16],                expected: '0000000000000000000000000000000000000000000000000000000000000010'});
        test({ types: ['int'], values: [-1],                expected: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'});
        test({ types: ['int256'], values: [1],              expected: '0000000000000000000000000000000000000000000000000000000000000001'});
        test({ types: ['int256'], values: [16],             expected: '0000000000000000000000000000000000000000000000000000000000000010'});
        test({ types: ['int256'], values: [-1],             expected: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'});
        test({ types: ['bytes32'], values: ['gavofyork'],   expected: '6761766f66796f726b0000000000000000000000000000000000000000000000'});
        test({ types: ['bytes'], values: ['gavofyork'],     expected: '0000000000000000000000000000000000000000000000000000000000000009' +
                                                                      '6761766f66796f726b0000000000000000000000000000000000000000000000'});
        test({ types: ['int[]'], values: [[3]],             expected: '0000000000000000000000000000000000000000000000000000000000000001' +
                                                                      '0000000000000000000000000000000000000000000000000000000000000003'});
        test({ types: ['int256[]'], values: [[3]],          expected: '0000000000000000000000000000000000000000000000000000000000000001' +
                                                                      '0000000000000000000000000000000000000000000000000000000000000003'});
        test({ types: ['int256[]'], values: [[1,2,3]],      expected: '0000000000000000000000000000000000000000000000000000000000000003' +
                                                                      '0000000000000000000000000000000000000000000000000000000000000001' +
                                                                      '0000000000000000000000000000000000000000000000000000000000000002' +
                                                                      '0000000000000000000000000000000000000000000000000000000000000003'});
        test({ types: ['bytes32', 'int'], values: ['gavofyork', 5],
                                                            expected: '6761766f66796f726b0000000000000000000000000000000000000000000000' + 
                                                                      '0000000000000000000000000000000000000000000000000000000000000005'});
        test({ types: ['int', 'bytes32'], values: [5, 'gavofyork'],
                                                            expected: '0000000000000000000000000000000000000000000000000000000000000005' + 
                                                                      '6761766f66796f726b0000000000000000000000000000000000000000000000'});
        test({ types: ['bytes', 'int'], values: ['gavofyork', 5],
                                                            expected: '0000000000000000000000000000000000000000000000000000000000000009' + 
                                                                      '0000000000000000000000000000000000000000000000000000000000000005' + 
                                                                      '6761766f66796f726b0000000000000000000000000000000000000000000000'});
        test({ types: ['int', 'bytes'], values: [5, 'gavofyork'],
                                                            expected: '0000000000000000000000000000000000000000000000000000000000000009' + 
                                                                      '0000000000000000000000000000000000000000000000000000000000000005' + 
                                                                      '6761766f66796f726b0000000000000000000000000000000000000000000000'});
        test({ types: ['int', 'bytes', 'int', 'int', 'int', 'int[]'], values: [1, 'gavofyork', 2, 3, 4, [5, 6, 7]],
                                                            expected: '0000000000000000000000000000000000000000000000000000000000000009' +
                                                                      '0000000000000000000000000000000000000000000000000000000000000003' +
                                                                      '0000000000000000000000000000000000000000000000000000000000000001' +
                                                                      '0000000000000000000000000000000000000000000000000000000000000002' +
                                                                      '0000000000000000000000000000000000000000000000000000000000000003' +
                                                                      '0000000000000000000000000000000000000000000000000000000000000004' +
                                                                      '6761766f66796f726b0000000000000000000000000000000000000000000000' +
                                                                      '0000000000000000000000000000000000000000000000000000000000000005' +
                                                                      '0000000000000000000000000000000000000000000000000000000000000006' +
                                                                      '0000000000000000000000000000000000000000000000000000000000000007'});
                                                                       
    });
});


