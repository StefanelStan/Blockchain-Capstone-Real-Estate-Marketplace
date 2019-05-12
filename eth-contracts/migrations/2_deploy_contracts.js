// migrating the appropriate contracts
//var SquareVerifier = artifacts.require("./SquareVerifier.sol");
var ERC721MintableComplete = artifacts.require("./ERC721MintableComplete.sol");
//var SolnSquareVerifier = artifacts.require("./SolnSquareVerifier.sol");

module.exports = async (deployer) => {
//  deployer.deploy(SquareVerifier);
  await deployer.deploy(ERC721MintableComplete, "SS_ERC721MintableToken", "SS_721M");
//  deployer.deploy(SolnSquareVerifier);
};
