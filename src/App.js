import "./App.css";
import "bulma/css/bulma.min.css";
import React, { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import loadContract from "./utils/load-contract";

// Actually, provider is the one that tells if we have metamask or not.
// If provider is null, it simply  means that we do not have metamask

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
    isProviderLoaded: false,
  });

  const [account, setAccount] = useState(null);
  const [contractBalance, setContractBalance] = useState(null);
  const [shouldReload, reload] = useState(false);

  const canConnectToContract = account && web3Api.contract;

  const reloadEffect = useCallback(() => reload(!shouldReload), [shouldReload]);

  const setAccountListener = (provider) => {
    provider.on("accountsChanged", (_) => {window.location.reload()})
    provider.on("chainChanged", (_) => {window.location.reload()})

    // Listen to metamask lock event

    // provider._jsonRpcConnection.events.on("notification", (payload) => {
    //   const { method } = payload

    //   console.log(method)

    //   if (method === "metamask_unlockStateChanged") {
    //     setAccount(null)
    //   }
    // })
  };

  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api;
      const balance = await web3.eth.getBalance(contract.address);

      // console.log(balance)

      setContractBalance(web3.utils.fromWei(balance, "ether"));

      // console.log(shouldReload)
    };

    web3Api.web3 && canConnectToContract && loadBalance();
  }, [web3Api, shouldReload, canConnectToContract]);

  useEffect(() => {
    const loadProvider = async () => {
      let provider = await detectEthereumProvider();

      if (provider) {
        const contract = await loadContract("Faucet", provider);
        setAccountListener(provider);
        setWeb3Api({
          provider,
          web3: new Web3(provider),
          contract,
          isProviderLoaded: true,
        });
      } else {
        setWeb3Api((prevWeb3Api) => {
          return { ...prevWeb3Api, isProviderLoaded: true };
        });
        console.error("Please install metamask");
      }
    };

    loadProvider();
  }, []);

  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts();
      setAccount(accounts[0]);
    };

    web3Api.web3 && getAccount();
  }, [web3Api.web3]);

  // Without useCallback, whenever the button is pressed, a new  instance of donateEth() method will be created. But with useCallback() a new instance of donateEth() method will be created if and only if there is a change in the objects present in the dependency array.

  const donateEth = useCallback(async () => {
    console.log("Donate Eth");
    const { contract, web3 } = web3Api;
    await contract.sendTransaction({
      from: account,
      value: web3.utils.toWei("1", "ether"),
    });

    // The line below will reload the browser
    // window.location.reload()

    reloadEffect();
  }, [web3Api, account, reloadEffect]);

  const withdrawFunds = async () => {
    const { web3, contract } = web3Api;
    const withdrawAmount = web3.utils.toWei("0.05", "ether");
    await contract.withdraw(withdrawAmount, { from: account });

    reloadEffect();
  };

  return (
    <>
      <div className="faucet-wrapper">
        <div className="faucet">
          {web3Api.isProviderLoaded ? (
            <div className="is-flex is-align-items-center">
              <span className="mr-2">
                <strong>Account: </strong>
              </span>

              <div>
                {account ? (
                  <span>{account}</span>
                ) : !web3Api.provider ? (
                  <>
                    <div className="notification is-warning is-size-6 is-rounded">
                      Wallet is not detected {` `}
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href="https://docs.metamask.io"
                      >
                        Install Metamask
                      </a>
                    </div>
                  </>
                ) : (
                  <button
                    className="button is-light is-small"
                    onClick={() => {
                      web3Api.provider.request({
                        method: "eth_requestAccounts",
                      });
                    }}
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          ) : (
            <span>Looking for Wallet...</span>
          )}

          <div className="balance-view is-size-4 my-4">
            Current Balance: <strong>{contractBalance}</strong> ETH
          </div>

          {!canConnectToContract && (
            <i className="is-block">Connect to Ganache</i>
          )}

          <button
            disabled={!canConnectToContract}
            onClick={donateEth}
            className="btn mr-2 ml-2 button is-link is-small"
          >
            Donate 1 ETH
          </button>
          <button
            disabled={!canConnectToContract}
            onClick={withdrawFunds}
            className="btn button is-success is-small"
          >
            Withdraw 0.01 ETH
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
