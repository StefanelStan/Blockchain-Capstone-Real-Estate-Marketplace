// Test if a new solution can be added for contract - SolnSquareVerifier
// Test if an ERC721 token can be minted for contract - SolnSquareVerifier
const expect = require('chai').expect;
const truffleAssert = require('truffle-assertions');

const verifierContractDefinition = artifacts.require('Verifier');
const solnSquareContractDefinition = artifacts.require('SoldSquareVerifier');

const proofFromFile = require("../../zokrates/code/proof.json");

contract('SoldSquareVerifier', accounts => {

    let proofAsUint;
    let contractInstance;
    const name = "SS_ERC721MintableToken";
    const symbol = "SS_721M";
    proofAsUint = getProofAsUint();

    describe('Test suite: addSolution', () => {

        before(async() => { 
            const verifier = await verifierContractDefinition.new({from: accounts[0]});
            contractInstance = await solnSquareContractDefinition.new(verifier.address, name, symbol, {from: accounts[0]});
        }); 

        it('should NOT allow to add a solution with invalid values', async() => {});
        it('should allow to add a solution with correct values and emit event', async() => {});
        it('should NOT allow to add a solution if one exists already', async() => {});

    });

    describe('Test suite: mint', () => {
        before(async() => { 
            const verifier = await verifierContractDefinition.new({from: accounts[0]});
            contractInstance = await solnSquareContractDefinition.new(verifier.address, name, symbol, {from: accounts[0]});
        });

        it('should NOT mint a token if solution has not been verified', async() => {}); 
        it('should NOT mint a token if solution has been verified on a different account', async() => {});
        it('should mint a token and emit events and verify owner and token balance', async() => {});
        it('should NOT mint another token if a token for the same solution exists already', async() => {});

    });

});

const getProofAsUint = () => {
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