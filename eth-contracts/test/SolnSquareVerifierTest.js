// Test if a new solution can be added for contract - SolnSquareVerifier
// Test if an ERC721 token can be minted for contract - SolnSquareVerifier
const expect = require('chai').expect;
const truffleAssert = require('truffle-assertions');

const verifierContractDefinition = artifacts.require('Verifier');
const solnSquareContractDefinition = artifacts.require('SolnSquareVerifier');

const proofFromFile_9 = require("../../zokrates/code/attempt1/proof.json");
const proofFromFile_16 = require("../../zokrates/code/attempt2/proof.json");

contract('SolnSquareVerifier', accounts => {

    let contractInstance;
    const name = "SS_ERC721MintableToken";
    const symbol = "SS_721M";
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    const baseTokenURI = "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/";
    const proofAsUint_9 = getProofAsUint(proofFromFile_9);
    const proofAsUint_16 = getProofAsUint(proofFromFile_16);
    describe('Test suite: addSolution', () => {

        before(async() => { 
            const verifier = await verifierContractDefinition.new({from: accounts[0]});
            contractInstance = await solnSquareContractDefinition.new(verifier.address, name, symbol, {from: accounts[0]});
        }); 

        it('should NOT allow to addSolution with invalid values or unverifyable solution', async() => {
            await expectToRevert(
                contractInstance.addSolution(
                    proofAsUint_9.proof.A,
                    proofAsUint_9.proof.A_p,
                    proofAsUint_9.proof.B,
                    proofAsUint_9.proof.B_p,
                    proofAsUint_9.proof.C,
                    proofAsUint_9.proof.C_p,
                    proofAsUint_9.proof.H,
                    proofAsUint_9.proof.K,
                    [16, 1]
                ),
                "Solution could not be verified");
        });

        it('should allow to add a solution with correct values and emit event', async() => {
            let tx = await contractInstance.addSolution(
                proofAsUint_9.proof.A,
                proofAsUint_9.proof.A_p,
                proofAsUint_9.proof.B,
                proofAsUint_9.proof.B_p,
                proofAsUint_9.proof.C,
                proofAsUint_9.proof.C_p,
                proofAsUint_9.proof.H,
                proofAsUint_9.proof.K,
                proofAsUint_9.input,
                {from: accounts[0]}
            );
            
            truffleAssert.eventEmitted(tx, 'SolutionAdded', (ev) => {
                return expect(Number(ev.solutionIndex)).to.equal(0) && expect(ev.solutionAddress).to.equal(accounts[0]);
            });
        });

        it('should NOT allow to add a solution if the same solution exists already', async() => {
            await expectToRevert(
                contractInstance.addSolution(
                    proofAsUint_9.proof.A,
                    proofAsUint_9.proof.A_p,
                    proofAsUint_9.proof.B,
                    proofAsUint_9.proof.B_p,
                    proofAsUint_9.proof.C,
                    proofAsUint_9.proof.C_p,
                    proofAsUint_9.proof.H,
                    proofAsUint_9.proof.K,
                    proofAsUint_9.input, 
                    { from: accounts[0] }
                ), 
                "Solution exists already");
        });

        it('should allow to add more new solutions with correct values and emit event', async() => {
            let tx = await contractInstance.addSolution(
                proofAsUint_16.proof.A,
                proofAsUint_16.proof.A_p,
                proofAsUint_16.proof.B,
                proofAsUint_16.proof.B_p,
                proofAsUint_16.proof.C,
                proofAsUint_16.proof.C_p,
                proofAsUint_16.proof.H,
                proofAsUint_16.proof.K,
                proofAsUint_16.input,
                {from: accounts[0]}
            );
            
            truffleAssert.eventEmitted(tx, 'SolutionAdded', (ev) => {
                return expect(Number(ev.solutionIndex)).to.equal(1) && expect(ev.solutionAddress).to.equal(accounts[0]);
            });
        });

    });

    describe('Test suite: mintNewNFT', () => {
        before(async() => { 
            const verifier = await verifierContractDefinition.new({from: accounts[0]});
            contractInstance = await solnSquareContractDefinition.new(verifier.address, name, symbol, {from: accounts[0]});
        });

        it('should NOT mint a token via mintNewNFT if solution has not been verified', async() => {
            await expectToRevert(contractInstance.mintNewNFT(16, 1, accounts[1], {from: accounts[0]}), "Solution does not exist");
        }); 
        
        it('should NOT mint a token if solution has been verified on a different account', async() => {
            await contractInstance.addSolution(
                proofAsUint_9.proof.A,
                proofAsUint_9.proof.A_p,
                proofAsUint_9.proof.B,
                proofAsUint_9.proof.B_p,
                proofAsUint_9.proof.C,
                proofAsUint_9.proof.C_p,
                proofAsUint_9.proof.H,
                proofAsUint_9.proof.K,
                proofAsUint_9.input,
                {from: accounts[0]}
            );
            await expectToRevert(contractInstance.mintNewNFT(9,1, accounts[1], {from:accounts[1]}), "Only solution address can use it to mint a token");
        });
        
        it('should mint a token if solution is valid, emit events and verify owner and token balance', async() => {
            let tx = await contractInstance.mintNewNFT(9, 1, accounts[2], {from:accounts[0]});
            truffleAssert.eventEmitted(tx, 'Transfer', (ev) => {
                return expect(ev.from).to.deep.equal(zeroAddress) 
                       && expect(ev.to).to.equal(accounts[2])
                       && expect(Number(ev.tokenId)).to.equal(0);
            });

            expect(await contractInstance.ownerOf(0)).to.equal(accounts[2]);
            expect(Number(await contractInstance.balanceOf(accounts[2]))).to.equal(1);
            expect(await contractInstance.tokenURI(0)).to.deep.equal(`${baseTokenURI}0`);

        });
        
        it('should NOT mint another token if a token for the same solution exists already', async() => {
            await expectToRevert(contractInstance.mintNewNFT(9, 1, accounts[1], {from:accounts[0]}), "Token already minted for this solution");
        });

        it('should mint a NEW token for a NEW valid solution, emit events and verify owner and token balance', async() => {
            await contractInstance.addSolution(
                proofAsUint_16.proof.A,
                proofAsUint_16.proof.A_p,
                proofAsUint_16.proof.B,
                proofAsUint_16.proof.B_p,
                proofAsUint_16.proof.C,
                proofAsUint_16.proof.C_p,
                proofAsUint_16.proof.H,
                proofAsUint_16.proof.K,
                proofAsUint_16.input,
                {from: accounts[0]}
            );
            
            let tx = await contractInstance.mintNewNFT(16, 1, accounts[2], {from:accounts[0]});
            truffleAssert.eventEmitted(tx, 'Transfer', (ev) => {
                return expect(ev.from).to.deep.equal(zeroAddress) 
                       && expect(ev.to).to.equal(accounts[2])
                       && expect(Number(ev.tokenId)).to.equal(1);
            });

            expect(await contractInstance.ownerOf(1)).to.equal(accounts[2]);
            expect(Number(await contractInstance.balanceOf(accounts[2]))).to.equal(2);
            expect(await contractInstance.tokenURI(1)).to.deep.equal(`${baseTokenURI}1`);
        });

    });

});

function getProofAsUint(proofFromFile) {
    return {
        "proof": {
            "A": [web3.utils.toBN(proofFromFile.proof.A[0]).toString(), web3.utils.toBN(proofFromFile.proof.A[1]).toString()],
            "A_p": [web3.utils.toBN(proofFromFile.proof.A_p[0]).toString(), web3.utils.toBN(proofFromFile.proof.A_p[1]).toString()],
            "B": [[web3.utils.toBN(proofFromFile.proof.B[0][0]).toString(), web3.utils.toBN(proofFromFile.proof.B[0][1]).toString()],
                [web3.utils.toBN(proofFromFile.proof.B[1][0]).toString(), web3.utils.toBN(proofFromFile.proof.B[1][1]).toString()]
            ],
            "B_p": [web3.utils.toBN(proofFromFile.proof.B_p[0]).toString(), web3.utils.toBN(proofFromFile.proof.B_p[1]).toString()],
            "C": [web3.utils.toBN(proofFromFile.proof.C[0]).toString(), web3.utils.toBN(proofFromFile.proof.C[1]).toString()],
            "C_p": [web3.utils.toBN(proofFromFile.proof.C_p[0]).toString(), web3.utils.toBN(proofFromFile.proof.C_p[1]).toString()],
            "H": [web3.utils.toBN(proofFromFile.proof.H[0]).toString(), web3.utils.toBN(proofFromFile.proof.H[1]).toString()],
            "K": [web3.utils.toBN(proofFromFile.proof.K[0]).toString(), web3.utils.toBN(proofFromFile.proof.K[1]).toString()]
        },
        "input": proofFromFile.input
    };
};

const expectToRevert = (promise, errorMessage) => {
    return truffleAssert.reverts(promise, errorMessage);
};