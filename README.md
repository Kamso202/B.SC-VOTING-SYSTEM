# UNIZIK Blockchain Voting System

A secure, transparent, and decentralized voting system built for Nnamdi Azikiwe University using blockchain technology.

## Features

- **Secure Voting**: Cryptographically secured votes recorded on the blockchain
- **Transparent Results**: Real-time, publicly verifiable election results
- **Voter Registration**: Secure voter registration with student ID verification
- **Admin Panel**: Complete election and candidate management system
- **Real-time Dashboard**: Live results with charts and analytics
- **Mobile Responsive**: Works seamlessly on all devices

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Blockchain**: Ethereum, Solidity smart contracts
- **Development**: Hardhat, ethers.js
- **Charts**: Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd blockchain-voting-system
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   Add your environment variables:
   \`\`\`
   NEXT_PUBLIC_API_URL=http://localhost:3000
   \`\`\`

4. **Compile smart contracts**
   \`\`\`bash
   npm run compile-contracts
   \`\`\`

5. **Start local blockchain (in a separate terminal)**
   \`\`\`bash
   npx hardhat node
   \`\`\`

6. **Deploy contracts to local network**
   \`\`\`bash
   npm run deploy-contracts
   \`\`\`

7. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

8. **Open your browser**
   Navigate to `http://localhost:3000`

### MetaMask Setup

1. Install MetaMask browser extension
2. Add local Hardhat network:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH
3. Import a test account using one of the private keys from Hardhat node output

## Usage

### For Students (Voters)

1. **Connect Wallet**: Click "Connect MetaMask Wallet" on the homepage
2. **Register to Vote**: 
   - Go to Register tab
   - Select an active election
   - Enter your student ID (format: YYYY/XXX, e.g., 2024/001)
3. **Cast Your Vote**:
   - Go to Vote tab
   - Select the election
   - Review candidates and their manifestos
   - Click "Vote for this Candidate"
4. **View Results**: Check real-time results in the Results tab

### For Administrators

1. **Access Admin Panel**: Connect with the admin wallet and navigate to Admin tab
2. **Create Elections**:
   - Fill in election details
   - Set start and end dates/times
   - Click "Create Election"
3. **Add Candidates**:
   - Select the election ID
   - Enter candidate information and manifesto
   - Click "Add Candidate"

## Smart Contract Architecture

### VotingSystem.sol

The main smart contract handles:
- Election creation and management
- Voter registration with student ID verification
- Secure vote casting with fraud prevention
- Automatic vote tallying and result calculation
- Admin functions for election control

Key features:
- **Immutable votes**: Once cast, votes cannot be altered
- **Double voting prevention**: Each voter can only vote once per election
- **Transparent results**: All votes are publicly verifiable
- **Time-based controls**: Elections have defined start/end times

## API Endpoints

- `GET /api/elections` - Get all elections
- `POST /api/elections` - Create new election (admin only)
- `GET /api/candidates` - Get candidates for an election
- `POST /api/candidates` - Add candidate (admin only)
- `POST /api/voters` - Register voter
- `POST /api/votes` - Cast vote
- `GET /api/results` - Get election results

## Security Features

- **Blockchain Immutability**: Votes cannot be altered once recorded
- **Cryptographic Security**: All transactions are cryptographically signed
- **Decentralized Verification**: No single point of failure
- **Student ID Validation**: Prevents unauthorized voting
- **Time-based Access Control**: Elections have strict time boundaries
- **Admin Access Control**: Only authorized admins can create elections

## Testing

Run the smart contract tests:
\`\`\`bash
npm run test-contracts
\`\`\`

## Deployment

### Local Development
The system is configured to work with Hardhat's local blockchain for development and testing.

### Production Deployment
For production deployment:
1. Configure environment variables for your target network
2. Update Hardhat config for your chosen network (Sepolia, Mainnet, etc.)
3. Deploy contracts: `npm run deploy-contracts --network <network-name>`
4. Update frontend configuration with deployed contract addresses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Acknowledgments

- Nnamdi Azikiwe University for the project requirements
- Ethereum community for blockchain infrastructure
- Open source contributors for the tools and libraries used
