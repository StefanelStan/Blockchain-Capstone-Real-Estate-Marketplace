App = {
    web3Provider: null,
    contracts: {},
    
    init: async () => {
        return await App.initWeb3();
    },

    initWeb3: async () => {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access");
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
            console.log('Using localhost ganache as provider!');
        }

        App.getMetaskAccountID();

        return App.initContracts();
    },

    getMetaskAccountID: function () {
        web3 = new Web3(App.web3Provider);

        // Retrieving accounts
        web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err);
                return;
            }
            //console.log('getMetaskID:',res);
            App.metamaskAccountID = res[0];

        })
    },

    initContracts: async() => {
        /// Source the truffle compiled smart contracts
        var jsonAppContract ='../../eth-contracts/build/contracts/SolnSquareVerifier.json';

        /// JSONfy the smart contracts
        $.getJSON(jsonAppContract, (data) => {
            //console.log('data', data);
            var ContractArtifact = data;
            App.contracts.AppContract = TruffleContract(ContractArtifact);
            App.contracts.AppContract.setProvider(App.web3Provider);
            App.fetchEvents();
        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async (event) => {
        App.getMetaskAccountID();
        
        var processId = parseInt($(event.target).data('id'));
        switch (processId) {
            case 0:
                return await App.getContractOwner(event);
            case 1:
                return await App.getTokenDetails(event);
            case 2:
                return await App.getTokenBalance(event);
            case 3:
                return await App.approveSolution(event)
            case 4:
                return await App.mintWithSolution(event);
            case 5:
                return await App.mint(event);
        }
    },
    getContractOwner: async(event) => {
        try {
            event.preventDefault();
            const instance = await App.contracts.AppContract.deployed(); 
            const result = await instance.owner();
            $("#contractOwner").val(result);
            console.log('Get Sols Square Verifier Contract Owner', result);
        } catch(err) {
            console.log(err.message);
        };
    },

    getTokenDetails: async (event) => {
        const _tokenId = $("#tokenId").val();
        try {
            event.preventDefault();
            const instance = await App.contracts.AppContract.deployed(); 
            const tokenURI = await instance.tokenURI(_tokenId);
            const tokenOwner = await instance.ownerOf(_tokenId);
            $("#tokenOwner").val(tokenOwner);
            $("#tokenURI").val(tokenURI);
            console.log(`Get token details: ${_tokenId}: ${tokenOwner} - ${tokenURI}`);
        } catch(err) {
            console.log(err.message);
            $("#tokenURI").val(`Token id ${_tokenId} does not exist`);
        };
    },

    getTokenBalance: async (event) => {
        try {
            event.preventDefault();
            const instance = await App.contracts.AppContract.deployed();
            const owner = $("#balanceOwner").val();
            const balance = await instance.balanceOf(owner);
            $("#tokenBalance").val(balance);
            console.log(`Get Token Balance for ${owner} : ${balance}`);

        } catch(err) {
            console.log(err.message);
        };
    },

    approveSolution: async (event) => {
        try {
            event.preventDefault();
            const instance = await App.contracts.AppContract.deployed(); 
            const A = [App.hexToNumber($("#proofA0").val()), App.hexToNumber($("#proofA1").val())];
            const A_p = [App.hexToNumber($("#proofAp0").val()), App.hexToNumber($("#proofAp1").val())];
            const B = [
                [App.hexToNumber($("#proofB00").val()), App.hexToNumber($("#proofB01").val())],
                [App.hexToNumber($("#proofB10").val()), App.hexToNumber($("#proofB11").val())]
            ];
            const B_p = [App.hexToNumber($("#proofBp0").val()), App.hexToNumber($("#proofBp1").val())];
            const C = [App.hexToNumber($("#proofC0").val()), App.hexToNumber($("#proofC1").val())];
            const C_p = [App.hexToNumber($("#proofCp0").val()), App.hexToNumber($("#proofCp1").val())];
            const H = [App.hexToNumber($("#proofH0").val()), App.hexToNumber($("#proofH1").val())];
            const K = [App.hexToNumber($("#proofK0").val()), App.hexToNumber($("#proofK1").val())];
            const input = [$("#proofinput0").val(), $("#proofinput1").val()];
            const result = await instance.addSolution(A, A_p, B, B_p, C, C_p, H, K, input);
            console.log('Approve Solution', result);
        } catch(err) {
            console.log(err.message);
        };
    },

    mintWithSolution: async(event) => {
        try {
            event.preventDefault();
            const instance = await App.contracts.AppContract.deployed();
            const input0 = $("#mintsolutioninput0").val();
            const input1 = $("#mintsolutioninput1").val();
            const addressTo = $("#mintsolutionto").val();
            const result = await instance.mintNewNFT(input0, input1, addressTo);
            console.log(`Mint With Solution to ${addressTo}`);
        } catch(err) {
            console.log(err.message);
        };
    },

    mint: async(event) => {
        try {
            event.preventDefault();
            const instance = await App.contracts.AppContract.deployed();
            const mintTokenId = $("#minttokenid").val();
            const addressTo = $("#mintto").val();
            const result = await instance.mint(addressTo, mintTokenId);
            console.log(`Mint tokenid ${mintTokenId} to ${addressTo}`);
        } catch(err) {
            console.log(err.message);
        };
    },

    hexToNumber: (numberAsHex) => {
        return web3.toBigNumber(numberAsHex);
    },

   
    fetchEvents: async () => {
        if (typeof App.contracts.AppContract.currentProvider.sendAsync !== "function") {
            App.contracts.AppContract.currentProvider.sendAsync = function () {
                return App.contracts.AppContract.currentProvider.send.apply(App.contracts.AppContract.currentProvider, arguments);
            };
        }
        try {
            const instance = await App.contracts.AppContract.deployed();
            instance.allEvents((err, log) => {
                if (!err) {
                    App.handleEvent(log);
                }
            });
        } catch (err) {
            console.log(err.message);
        };
    },

    handleEvent: (log) =>{
        let eventLog = '';
        switch(log.event) {
            case "Verified": 
                eventLog = `${log.event} : Message ${log.args.s}`;
                break;
            case "SolutionAdded":
                eventLog = `${log.event} : Solution Index: ${log.args.solutionIndex} Solution Address: ${log.args.solutionAddress}`;
                break;
            case "Transfer":
                eventLog = `${log.event} : From: ${log.args.from} To: ${log.args.to} Token ID: ${log.args.tokenId}`;
                break;
        }
        console.log(eventLog);
        $("#ftc-events").append('<li>' + eventLog + '</li>');
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
