const expect = require('chai').expect;
const truffleAssert = require('truffle-assertions');

const contractDefinition = artifacts.require('ERC721MintableComplete');

contract('ERC721MintableComplete', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];
    const name = "SS_ERC721MintableToken";
    const symbol = "SS_721M";
    const baseTokenURI = "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/";
    let currentOwner;
    let contractInstance;
    
    describe('Test suite: Ownable inherited', function () {
        before(async() => { 
            contractInstance = await contractDefinition.new(name, symbol, {from: account_one});
            currentOwner = account_one;
        });

        it('should return contract owner', async() => { 
            expect(await contractInstance.owner({from: account_two})).to.equal(currentOwner); ;
        });

        it('should NOT allow unauthorized address to transfer ownership', async() => {
            await expectToRevert(contractInstance.transferOwnership(account_two, {from: account_two}), 'Caller is not the contract owner');
        });

        it('should allow to transfer ownership and emit event', async() => {
            let tx = await contractInstance.transferOwnership(account_two, {from: currentOwner});
            truffleAssert.eventEmitted(tx, 'OwnershipTransferred', (ev) => {
                return expect(ev.previousOwner).to.deep.equal(currentOwner) && expect(ev.newOwner).to.equal(account_two);
            });
            currentOwner = account_two;
            expect(await contractInstance.owner({from: account_two})).to.equal(currentOwner);
        });

        it('should fail when minting when address is not contract owner', async() => { 
            
        });

    });

    describe('Test suite: Pausable inherited', function () {
        before(async() => { 
            contractInstance = await contractDefinition.new(name, symbol, {from: account_one});
        });

        it('should NOT allow unauthorized address to pause the contract', async() => {
            await expectToRevert(contractInstance.pause({from: account_two}), 'Caller is not the contract owner');
        });

        it('should NOT allow unauthorized address to unpause the contract', async() => {
            await expectToRevert(contractInstance.unpause({from: account_two}), 'Caller is not the contract owner');
        });

        it('should allow owner to pause the contract and emit event', async() => {
            let tx = await contractInstance.pause({from: account_one});
            truffleAssert.eventEmitted(tx, 'Paused', (ev) => {
                return expect(ev.account).to.deep.equal(account_one);
            });
        });

        it('should NOT allow owner to pause the contract when contract is already paused', async() => {
            await expectToRevert(contractInstance.pause({from: account_one}), 'Contract is currently paused');
        });

        it('should allow owner to unpause the contract and emit event', async() => {
            let tr = await contractInstance.unpause({from: account_one});
            truffleAssert.eventEmitted(tr, 'Unpaused', (ev) => {
                return expect(ev.account).to.deep.equal(account_one);
            });
        });

        it('should NOT allow owner to unpause the contract when contract is already unpaused', async() => {
            await expectToRevert(contractInstance.unpause({from: account_one}), 'Contract is not currently paused');
        });

        it('should fail when minting when contract is paused', async() => { 
            //expectToRevert(contractInstance.transferOwnership(account_two, {from: account_two}), 'Caller is not the contract owner');
        });

    });
    
    describe('Test suite: ERC721Metadata inherited', () =>{
        before(async() => { 
            contractInstance = await contractDefinition.new(name, symbol, {from: account_one});
        });

        it('should get the correct token name', async() => {
            expect(await contractInstance.getName({from: account_two})).to.equal(name);
        });

        it('should get the correct token symbol', async() => {
            expect(await contractInstance.getSymbol({from: account_two})).to.equal(symbol);
        });

        it('should get the correct token baseTokenURI', async() => {
            expect(await contractInstance.getBaseTokenURI({from: account_two})).to.equal(baseTokenURI);
        });
    });

    describe('Test suite: ERC721MintableComplete', function () {
        beforeEach(async() => { 
            contractInstance = await contractDefinition.new(name, symbol, {from: account_one});

            // TODO: mint multiple tokens
        })

        it('should return total supply', async function () { 
            
        })

        it('should get token balance', async function () { 
            
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () { 
            
        })

        it('should transfer token from one owner to another', async function () { 
            
        })
    });

});

const expectToRevert = (promise, errorMessage) => {
    return truffleAssert.reverts(promise, errorMessage);
};