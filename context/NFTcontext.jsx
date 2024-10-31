import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { Buffer } from "buffer";
import { NFTStorage } from "nft.storage";

import { MarketAddress, MarketAddressABI } from "./constants";

const { create } = require("ipfs-http-client");
const projectId = "2ILASoqnYrKNkhULGunYeuS6Gqm";
const projectSecret = "dcd1058b27c16ae3dc166051b6908aaa";
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
  mode: "no-cors",
});

// const auth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString(
//   "base64"
// )}`;
// const client = ipfsHttpClient({
//   host: "ipfs.infura.io",
//   port: 5001,
//   protocol: "https",
//   headers: {
//     authorization: auth,
//   },
// });

// Smart contract
const fetchContract = (signerOrProvider) =>
  new ethers.Contract(MarketAddress, MarketAddressABI, signerOrProvider);

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const nftCurrency = "ETH";

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return alert("Please install Metamask");

    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    if (accounts.length) {
      setCurrentAccount(accounts[0]);
    } else {
      console.log("No Account found");
    }

    console.log({ accounts });
  };

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install Metamask");
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setCurrentAccount(accounts[0]);

    window.location.reload();
  };

  // Upload to IPFS
  const uploadToIPFS = async (file) => {
    try {
      const added = await client.add({ content: file });
      console.log("here1");
      const url = `https://realestatetoken.infura-ipfs.io/ipfs/${added.path}`;

      return url;
    } catch (error) {
      console.log("In upload to ipfs");
      console.log("Error uploading file to IPFS");
    }

    // try {
    //   const metadata = await client.store({
    //     name: "nft.storage store test",
    //     description: "Test ERC-1155 compatible metadata",
    //     image: file,
    //   });
    //   return metadata.data.image.href;
    // } catch (error) {
    //   console.log("Error uploading file to IPFS");
    // }
  };

  const createNFT = async (formInput, fileUrl, router) => {
    console.log("clicked");
    console.log(formInput);
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;

    const data = JSON.stringify({ name, description, image: fileUrl });

    try {
      const added = await client.add(data);
      console.log("1");
      const url = `https://realestatetoken.infura-ipfs.io/ipfs/${added.path}`;
      console.log("2");

      await createSale(url, price);
      console.log("3");

      router.push("/");
    } catch (error) {
      console.log(error);
      console.log("Error uploading file to IPFS1");
    }
  };

  const createSale = async (url, formInputPrice, isReselling, id) => {
    console.log(url);
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const price = ethers.utils.parseUnits(formInputPrice, "ether");
    const contract = fetchContract(signer);
    console.log(contract);

    const listingPrice = await contract.getListingPrice();

    const transaction = !isReselling
      ? await contract.createToken(url, price, {
          value: listingPrice.toString(),
        })
      : await contract.resellToken(id, price, {
          value: listingPrice.toString(),
        });

    await transaction.wait();

    // console.log(contract);
  };

  const fetchNFTs = async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://eth-goerli.g.alchemy.com/v2/IBEIe-QQgiK-iWlrHief67VcOzHFzOeU"
    );

    const contract = fetchContract(provider);
    console.log("fetch nfts");
    console.log(contract);
    console.log("executing till here");

    const data = await contract.fetchMarketItems();
    console.log("data:", data);
    const items = await Promise.all(
      data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        const tokenURI = await contract.tokenURI(tokenId);
        const {
          data: { image, name, description },
        } = await axios.get(tokenURI);
        const price = ethers.utils.formatUnits(
          unformattedPrice.toString(),
          "ether"
        );

        return {
          price,
          tokenId: tokenId.toNumber(),
          seller,
          owner,
          image,
          name,
          description,
          tokenURI,
        };
      })
    );
    console.log("items:", items);
    return items;
  };

  const fetchMyNFTsOrListedNFTs = async (type) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);

    const data =
      type === "fetchItemsListed"
        ? await contract.fetchItemsListed()
        : await contract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        const tokenURI = await contract.tokenURI(tokenId);
        const {
          data: { image, name, description },
        } = await axios.get(tokenURI);
        const price = ethers.utils.formatUnits(
          unformattedPrice.toString(),
          "ether"
        );

        return {
          price,
          tokenId: tokenId.toNumber(),
          seller,
          owner,
          image,
          name,
          description,
          tokenURI,
        };
      })
    );

    return items;
  };

  const buyNFT = async (nft) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price,
    });

    await transaction.wait();
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <NFTContext.Provider
      value={{
        nftCurrency,
        connectWallet,
        currentAccount,
        uploadToIPFS,
        createNFT,
        fetchNFTs,
        fetchMyNFTsOrListedNFTs,
        buyNFT,
        createSale,
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};
