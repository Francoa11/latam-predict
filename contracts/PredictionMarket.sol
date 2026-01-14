// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PredictionMarket {
    struct Market {
        uint256 id;
        string question;
        uint256 yesVotes;
        uint256 noVotes;
        bool resolved;
        uint8 outcome; // 0: NO, 1: YES
    }

    mapping(uint256 => Market) public markets;
    uint256 public nextMarketId;

    // Crea los mercados de tus pantallas (Inflación, River, etc.)
    function createMarket(string memory _question) external {
        markets[nextMarketId] = Market(nextMarketId, _question, 0, 0, false, 0);
        nextMarketId++;
    }

    // Procesa las apuestas reales
    function buyShares(uint256 _marketId, uint8 _side) external payable {
        require(msg.value > 0, "Envia fondos");
        if (_side == 1) {
            markets[_marketId].yesVotes += msg.value;
        } else {
            markets[_marketId].noVotes += msg.value;
        }
    }

    // Envía los datos a tus tarjetas del frontend
    function allMarkets() external view returns (Market[] memory) {
        Market[] memory m = new Market[](nextMarketId);
        for (uint i = 0; i < nextMarketId; i++) {
            m[i] = markets[i];
        }
        return m;
    }
}