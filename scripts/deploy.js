const { ethers } = require("hardhat")

async function main() {
  console.log("Deploying VotingSystem contract...")

  // Get the ContractFactory and Signers here
  const [deployer] = await ethers.getSigners()
  console.log("Deploying contracts with the account:", deployer.address)

  // Deploy the VotingSystem contract
  const VotingSystem = await ethers.getContractFactory("VotingSystem")
  const votingSystem = await VotingSystem.deploy()

  await votingSystem.waitForDeployment()
  const contractAddress = await votingSystem.getAddress()

  console.log("VotingSystem deployed to:", contractAddress)
  console.log("Admin address:", deployer.address)

  // Save the contract address and ABI for frontend use
  const fs = require("fs")
  const contractInfo = {
    address: contractAddress,
    abi: VotingSystem.interface.format("json"),
  }

  // Create contracts directory if it doesn't exist
  if (!fs.existsSync("./lib/contracts")) {
    fs.mkdirSync("./lib/contracts", { recursive: true })
  }

  fs.writeFileSync("./lib/contracts/VotingSystem.json", JSON.stringify(contractInfo, null, 2))

  console.log("Contract info saved to ./lib/contracts/VotingSystem.json")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
