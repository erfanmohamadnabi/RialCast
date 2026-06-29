# RialCast DApp

A decentralized Web3 gaming and betting platform built on **Ethereum Sepolia Testnet**.

- **Spin Wheel** — On-chain spin game, earn up to 100 points per roll
- **Football Betting** — Predict match outcomes, earn points for correct picks
- **Leaderboard** — Compete with other players
- **Profile** — Manage your avatar, social links, and view your points
- **Wallet Auth** — Sign-in with MetaMask (EIP-191)

**Stack:** Django + DRF (backend) · React (frontend) · Solidity + Hardhat (contracts)

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |
| MetaMask | latest browser extension |
| Sepolia ETH | [sepoliafaucet.com](https://sepoliafaucet.com) |

---

## Project Structure

```
rialcast/
├── backend/          # Django + DRF API
├── frontend/         # React app
├── contracts/        # Solidity contracts + Hardhat
└── docker-compose.yml
```

---

## 1. Smart Contracts Setup

### Install dependencies

```bash
cd contracts
npm install
```

### Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
PRIVATE_KEY=your_deployer_wallet_private_key
INFURA_PROJECT_ID=your_infura_project_id
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key   # optional, for verification
```

> ⚠️ **Never commit your private key.** Use a dedicated deployer wallet, not your main wallet.

### Compile contracts

```bash
npm run compile
```

### Deploy to Sepolia

```bash
npm run deploy:sepolia
```

The script will:
1. Deploy `SpinGame.sol` and `BetGame.sol` to Sepolia
2. Print the contract addresses
3. Automatically update `contracts_abi.json` and copy it to `frontend/src/utils/`

**Save the printed addresses** — you'll need them for backend and frontend `.env` files.

### (Optional) Deploy to local Hardhat node

```bash
# Terminal 1 — start local node
npm run node

# Terminal 2 — deploy locally
npm run deploy:local
```

---

## 2. Backend Setup (Django + DRF)

### Install Python dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Configure environment

```bash
cp .env.example .env
```

Edit `backend/.env`:

```
SECRET_KEY=your-secret-django-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000

INFURA_PROJECT_ID=your_infura_project_id
WEB3_PROVIDER_URL=https://sepolia.infura.io/v3/your_infura_project_id

SPIN_CONTRACT_ADDRESS=0xYourSpinContractAddress
BET_CONTRACT_ADDRESS=0xYourBetContractAddress
```

### Run migrations

```bash
python manage.py migrate
```

### Create a superuser (admin)

```bash
python manage.py createsuperuser
```

Follow the prompts. Then in Django admin, set the `wallet_address` field for your admin user so admin API endpoints work with your wallet.

### Start the backend server

```bash
python manage.py runserver
```

Backend runs at: **http://localhost:8000**

API docs (Swagger): **http://localhost:8000/api/docs/**

Django Admin: **http://localhost:8000/admin/**

---

## 3. Frontend Setup (React)

### Install dependencies

```bash
cd frontend
npm install
```

### Configure environment

```bash
cp .env.example .env
```

Edit `frontend/.env`:

```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_SPIN_CONTRACT_ADDRESS=0xYourSpinContractAddress
REACT_APP_BET_CONTRACT_ADDRESS=0xYourBetContractAddress
REACT_APP_NETWORK_ID=11155111
```

### Start the frontend dev server

```bash
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 4. Running Everything Together

### Option A — Manual (3 terminals)

```bash
# Terminal 1 — Backend
cd backend && source venv/bin/activate && python manage.py runserver

# Terminal 2 — Frontend
cd frontend && npm start

# Terminal 3 (optional) — Local blockchain
cd contracts && npm run node
```

### Option B — Docker Compose

```bash
# From root directory
docker-compose up --build
```

Services:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

---

## 5. MetaMask Configuration

1. Install [MetaMask](https://metamask.io/)
2. Add **Sepolia Testnet**:
   - Network Name: `Sepolia`
   - RPC URL: `https://sepolia.infura.io/v3/YOUR_ID`
   - Chain ID: `11155111`
   - Currency: `ETH`
   - Explorer: `https://sepolia.etherscan.io`
3. Get test ETH from [sepoliafaucet.com](https://sepoliafaucet.com)
4. Visit http://localhost:3000 and click **Connect Wallet**

---

## 6. Admin Usage

### Making a user admin in Django

```bash
python manage.py shell
```

```python
from apps.users.models import User
u = User.objects.get(wallet_address='0xyourwalletaddress')
u.is_staff = True
u.is_superuser = True
u.save()
```

### Creating a match (via Admin Panel)

1. Connect wallet as admin at http://localhost:3000
2. Go to http://localhost:3000/admin
3. Fill in match details and click **Create Match**

### Resolving a match

In the Admin page, find the match and click one of the **Resolve** buttons (Team 1 Win / Draw / Team 2 Win).

Points are automatically distributed to all correct voters.

---

## 7. Smart Contract Details

### SpinGame.sol

| Function | Description |
|----------|-------------|
| `spin()` | Payable — costs `spinFee` (0.001 ETH). Emits `Spun(player, result, timestamp)` |
| `setSpinFee(uint256)` | Owner only — update spin fee |
| `withdraw()` | Owner only — withdraw contract balance |

**Segments (1–8):** 10, 20, 5, 50, 15, 30, 100, 0 points

### BetGame.sol

| Function | Description |
|----------|-------------|
| `createMatch()` | Owner only — creates a new match, returns matchId |
| `vote(matchId, outcome)` | Cast vote: 1=Team1, 2=Team2, 3=Draw |
| `resolveMatch(matchId, result)` | Owner only — close match with result |
| `getVoteStats(matchId)` | View vote counts per outcome |
| `getUserVote(matchId, user)` | View a user's vote + hasVoted |

---

## 8. API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/nonce/` | Get nonce for wallet auth |
| POST | `/api/users/auth/` | Authenticate with signed nonce |
| GET | `/api/users/profile/` | Get own profile (auth required) |
| PATCH | `/api/users/profile/` | Update own profile |
| GET | `/api/users/profile/<id>/` | Get public profile by ID |

### Games
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/games/spin/submit/` | Submit spin result (auth) |
| GET | `/api/games/spin/recent/` | Last 10 spins |

### Bets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bets/` | List all matches |
| POST | `/api/bets/create/` | Create match (admin) |
| GET | `/api/bets/<id>/` | Match detail |
| POST | `/api/bets/<id>/vote/` | Cast vote (auth) |
| POST | `/api/bets/<id>/resolve/` | Resolve match (admin) |
| GET | `/api/bets/recent/` | Recent 10 votes |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard/` | Top 100 players |

---

## 9. Security Notes

- Wallet addresses of other users are **never exposed** via public API — only `short_wallet` (e.g. `0x1234...abcd`) is shown
- Profile URLs use internal numeric IDs, not wallet addresses
- JWT tokens are stored in `localStorage` — suitable for testnet; for production use `httpOnly` cookies
- Contract `spin()` result uses `block.prevrandao` — adequate for a testnet game; use Chainlink VRF for production

---

## 10. Troubleshooting

**MetaMask not detected**
→ Install MetaMask extension and refresh

**Wrong network error**
→ The app auto-prompts to switch to Sepolia; accept in MetaMask

**"Insufficient fee" on spin**
→ Make sure you have at least 0.001 Sepolia ETH + gas

**Admin endpoints return 403**
→ Your wallet must be linked to a Django superuser (see section 6)

**CORS errors**
→ Ensure `CORS_ALLOWED_ORIGINS` in backend `.env` matches your frontend URL

---

## License

MIT — free to use, modify, and distribute.
