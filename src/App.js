import Onboard from 'bnc-onboard'
import Web3 from 'web3'
import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';


function App() {
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [signer, setSigner] = useState(null);
  const [onboard, setOnboard] = useState(null);

  useEffect(() => {
    const handleUpdateWallet = (wallet) => {
      if (wallet.provider) {
        window.localStorage.setItem('selectedWallet', wallet.name);
        const provider = new ethers.providers.Web3Provider(wallet.provider);
        setProvider(provider);
        setSigner(() => provider.getSigner());
        setWeb3(new Web3(wallet.provider));
      } else {
        setSigner(null);
      }
    };

    const handleNetworkChange = (newNetworkId) => {
      console.log(newNetworkId)
      if (newNetworkId === 42) {
        localStorage.setItem('networkId', newNetworkId.toString());
        if (onboard === null) return;
        onboard.config({
          networkId: newNetworkId,
        });
      } else {
        console.error('Unsupported Network', newNetworkId);
      }
    };

    const RPC_URL = `https://kovan.infura.io/v3/99eaaebb57bb4a96bb0183c0f0c2e160`;

    const wallets = [
      { walletName: 'metamask', preferred: true },
      {
        walletName: 'ledger',
        preferred: true,
        rpcUrl: RPC_URL,
      },
    ];

    const initializationOptions = {
      dappId: '40cd095f-123d-48ac-8c66-b36aa8b08bd9', 
      networkId: 42, // [Integer] The Ethereum network ID your Dapp uses.
      subscriptions: {
        wallet: handleUpdateWallet,
        address: setAddress,
        network: handleNetworkChange,
      },
      walletSelect: { wallets },
      walletCheck: [
        { checkName: 'derivationPath' },
        { checkName: 'connect' },
        { checkName: 'accounts' },
        { checkName: 'network' },
      ],
    }
    const onboardObj = Onboard(initializationOptions)
    setOnboard(onboardObj)
  }, [])

  const selectWallet = async () => {
    await onboard.walletSelect().then((success) => {
      if (success) onboard.walletCheck();
    });
  }

  const signMessage = async () => {
    var message = {
      amount: 100,
      bidder: 323
    };

    const domain = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
      { name: "salt", type: "bytes32" },
    ];

    const bid = [
      { name: "amount", type: "uint256" },
      { name: "bidder", type: "uint256" },
    ];

    

    const chainId = parseInt(web3.version.network, 10);

    const domainData = {
      name: "My amazing dApp",
      version: "2",
      chainId: chainId,
      verifyingContract: "0x1C56346CD2A2Bf3202F771f50d3D14a367B48070",
      salt: "0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"
    };
  
    const data = JSON.stringify({
      types: {
        EIP712Domain: domain,
        Bid: bid,
      },
      domain: domainData,
      primaryType: "Bid",
      message: message
    });

    

    //const signer = web3.toChecksumAddress(web3.eth.accounts[0]);
    const signerAdd = await signer.getAddress()
    web3.currentProvider.sendAsync(
      {
        method: "eth_signTypedData_v4",
        params: [data],
        from: signerAdd 
      }, 
      function(err, result) {
        if (err || result.error) {
          return console.log(result);
        }

        console.log('Message signed')
      }
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>Address: <b>{address}</b></p>
        <button onClick={selectWallet}>Select wallet</button>
        {address !== null ? (
          <button onClick={signMessage}>
            Sign message
          </button>
        ) : null}
      </header>
    </div>
  );
}

export default App;
