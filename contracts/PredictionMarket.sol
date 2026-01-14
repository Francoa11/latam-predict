// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract PredictionMarket {
    struct Market {
        uint256 id;
        string question;
        uint256 yesVotes;
        uint256 noVotes;
        bool resolved;
        uint8 outcome; // 0: NO, 1: YES
    }

    address public owner;
    address public constant USDT = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F;
    address public constant USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174; // USDC.e (Bridged)

    mapping(uint256 => Market) public markets;
    uint256 public nextMarketId;

    // Track user balances per market
    mapping(uint256 => mapping(address => uint256)) public userYesShares;
    mapping(uint256 => mapping(address => uint256)) public userNoShares;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    function createMarket(string memory _question) external onlyOwner {
        markets[nextMarketId] = Market(nextMarketId, _question, 0, 0, false, 0);
        nextMarketId++;
    }

    // Buy shares with USDT or USDC
    // _token: 0 for USDT, 1 for USDC
    function buyShares(uint256 _marketId, uint8 _side, uint256 _amount, uint8 _token) external {
        require(!markets[_marketId].resolved, "Market resolved");
        address tokenAddr = (_token == 0) ? USDT : USDC;
        
        require(IERC20(tokenAddr).transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        if (_side == 1) {
            markets[_marketId].yesVotes += _amount;
            userYesShares[_marketId][msg.sender] += _amount;
        } else {
            markets[_marketId].noVotes += _amount;
            userNoShares[_marketId][msg.sender] += _amount;
        }
    }

    function claimWinnings(uint256 _marketId) external {
        require(markets[_marketId].resolved, "Market not resolved");
        uint8 outcome = markets[_marketId].outcome;
        uint256 userShares;
        uint256 winningPool;
        uint256 losingPool;

        if (outcome == 1) { // YES won
            userShares = userYesShares[_marketId][msg.sender];
            winningPool = markets[_marketId].yesVotes;
            losingPool = markets[_marketId].noVotes;
            userYesShares[_marketId][msg.sender] = 0;
        } else { // NO won
            userShares = userNoShares[_marketId][msg.sender];
            winningPool = markets[_marketId].noVotes;
            losingPool = markets[_marketId].yesVotes;
            userNoShares[_marketId][msg.sender] = 0;
        }

        require(userShares > 0, "No winnings");
        require(winningPool > 0, "Winning pool empty");

        // Parimutuel Payout
        uint256 totalPool = winningPool + losingPool;
        // Payout = (UserShares / WinningPool) * TotalPool
        // Scaled to avoid precision loss
        uint256 payout = (userShares * totalPool) / winningPool;

        IERC20 usdtToken = IERC20(USDT);
        IERC20 usdcToken = IERC20(USDC);

        // Try to pay in USDT first, then USDC
        if (usdtToken.balanceOf(address(this)) >= payout) {
             require(usdtToken.transfer(msg.sender, payout), "USDT transfer failed");
        } else {
             require(usdcToken.transfer(msg.sender, payout), "USDC transfer failed");
        }
    }

    function resolveMarket(uint256 _marketId, uint8 _outcome) external onlyOwner {
        require(!markets[_marketId].resolved, "Already resolved");
        markets[_marketId].resolved = true;
        markets[_marketId].outcome = _outcome;
    }

    function allMarkets() external view returns (Market[] memory) {
        Market[] memory m = new Market[](nextMarketId);
        for (uint i = 0; i < nextMarketId; i++) {
            m[i] = markets[i];
        }
        return m;
    }

    // Emergency withdraw for the owner
    function withdrawToken(address _token) external onlyOwner {
        uint256 bal = IERC20(_token).balanceOf(address(this));
        IERC20(_token).transfer(owner, bal);
    }
}