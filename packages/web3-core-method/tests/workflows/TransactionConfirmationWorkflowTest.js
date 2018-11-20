import * as sinonLib from 'sinon';
import {AbstractWeb3Module} from 'web3-core';
import AbstractMethodModel from '../../lib/models/AbstractMethodModel';
import ProvidersPackage from 'web3-providers';
import {PromiEvent} from 'web3-core-promievent';
import {formatters} from 'web3-core-helpers';
import TransactionConfirmationModel from '../../src/models/TransactionConfirmationModel';
import TransactionReceiptValidator from '../../src/validators/TransactionReceiptValidator';
import NewHeadsWatcher from '../../src/watchers/NewHeadsWatcher';
import TransactionConfirmationWorkflow from '../../src/workflows/TransactionConfirmationWorkflow';

const sinon = sinonLib.createSandbox();

/**
 * TransactionConfirmationWorkflow test
 */
describe('TransactionConfirmationWorkflowTest', () => {
    let transactionConfirmationWorkflow,
        transactionConfirmationModel,
        transactionConfirmationModelMock,
        transactionReceiptValidator,
        transactionReceiptValidatorMock,
        newHeadsWatcher,
        newHeadsWatcherMock,
        formattersMock,
        methodModel,
        methodModelMock,
        methodModelCallbackSpy,
        provider,
        providerMock,
        providerAdapter,
        providerAdapterMock,
        moduleInstance,
        moduleInstanceMock,
        promiEvent,
        promiEventMock;

    beforeEach(() => {
        transactionConfirmationModel = new TransactionConfirmationModel();
        transactionConfirmationModelMock = sinon.mock(transactionConfirmationModel);

        transactionReceiptValidator = new TransactionReceiptValidator();
        transactionReceiptValidatorMock = sinon.mock(transactionReceiptValidator);

        newHeadsWatcher = new NewHeadsWatcher();
        newHeadsWatcherMock = sinon.mock(newHeadsWatcher);

        formattersMock = sinon.mock(formatters);

        methodModel = new AbstractMethodModel();
        methodModelCallbackSpy = sinon.spy();
        methodModel.callback = methodModelCallbackSpy;
        methodModelMock = sinon.mock(methodModel);

        provider = new ProvidersPackage.WebsocketProvider('ws://127.0.0.1', {});
        providerMock = sinon.mock(provider);

        providerAdapter = new ProvidersPackage.SocketProviderAdapter(provider);
        providerAdapterMock = sinon.mock(providerAdapter);

        moduleInstance = new AbstractWeb3Module(providerAdapter, ProvidersPackage, null, null);
        moduleInstanceMock = sinon.mock(moduleInstance);

        promiEvent = new PromiEvent();
        promiEventMock = sinon.mock(promiEvent);

        transactionConfirmationWorkflow = new TransactionConfirmationWorkflow(
            transactionConfirmationModel,
            transactionReceiptValidator,
            newHeadsWatcher,
            formatters
        );
    });

    afterEach(() => {
        sinon.restore();
    });

    it('calls executes and receipt does already exists', () => {
        providerAdapterMock
            .expects('send')
            .withArgs('eth_getTransactionReceipt', ['0x0'])
            .returns(
                new Promise(resolve => {
                    resolve({});
                })
            )
            .once();

        formattersMock
            .expects('outputTransactionReceiptFormatter')
            .withArgs({})
            .returns({blockHash: '0x0'})
            .once();

        transactionReceiptValidatorMock
            .expects('validate')
            .withArgs({blockHash: '0x0'})
            .returns(true)
            .once();

        newHeadsWatcherMock.expects('stop').once();

        methodModelMock
            .expects('afterExecution')
            .withArgs({blockHash: '0x0'})
            .returns({blockHash: '0x00'})
            .once();

        transactionConfirmationWorkflow.execute(methodModel, moduleInstance, '0x0', promiEvent);

        promiEvent
            .on('receipt', receipt => {
                expect(receipt).to.has.an.property('blockHash', '0x00');
            })
            .then(response => {
                expect(methodModelCallbackSpy.calledOnce).to.be.true;
                expect(methodModelCallbackSpy.calledWith(false, {blockHash: '0x00'}));
                expect(response).to.has.an.property('blockHash', '0x00');

                providerMock.verify();
                formattersMock.verify();
                transactionReceiptValidatorMock.verify();
                newHeadsWatcherMock.verify();
                methodModelMock.verify();
            });
    });
});
