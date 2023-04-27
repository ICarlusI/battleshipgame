import { Contract, ethers } from "ethers";
import Battleship from "../../../backend/artifacts/contracts/Battleship.sol/Battleship.json";

export default function getContract(contractAddress: string): Contract {
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  const contract = new ethers.Contract(
    contractAddress,
    Battleship.abi,
    signer
  );

  return contract;
}