//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Battleship {
    address public player1;
    address public player2;
    bool public gameStarted;
    address public currentPlayer;

    struct Ship {
        string shipType;
        uint8 position;
        bool isHorizontal;
        uint size;
        uint hitCount;
    }

    struct PlayerData {
        mapping(uint => uint) grid;
        mapping(uint => Ship) ships;
        bool ready;
        uint shipsRemaining;
    }

    mapping(address => PlayerData) public playersData;

    event GameStarted(address player1, address player2);
    event PlayerReady(address player);
    event Turn(address currentPlayer);
    event AttackResult(address attacker, uint index, bool hit, bool sunk);
    event GameOver(address winner);

    mapping(address => bool) public playersReady;


    constructor() {
        player1 = msg.sender;
    }

   event PlayerJoined(address player);

function joinGame() external {
    require(player2 == address(0), "Game is already full.");
    require(msg.sender != player1, "You are already player 1."); // Ajoutez cette ligne
    player2 = msg.sender;
    emit PlayerJoined(msg.sender);
}

    function setGridAndShips(uint[] memory _grid, Ship[] memory _ships) external {
    require(!gameStarted, "Game has already started.");
    require(msg.sender == player1 || msg.sender == player2, "Not a player in the game.");
    require(_grid.length == 100);

    PlayerData storage playerData = playersData[msg.sender];
    for (uint i = 0; i < _grid.length; i++) {
        playerData.grid[i] = _grid[i];
    }

    for (uint i = 0; i < _ships.length; i++) {
        playerData.ships[i] = _ships[i];
        playerData.shipsRemaining += 1;
    }

    playersReady[msg.sender] = true; 

    emit PlayerReady(msg.sender);

    if (playersReady[player1] && playersReady[player2]) {
        startGame();
    }
}


    function startGame() private {
        gameStarted = true;
        currentPlayer = player1;
        emit GameStarted(player1, player2);
    }

    function setPlayerReady() public {
  require(msg.sender == player1 || msg.sender == player2, "Not a player");
  require(!playersReady[msg.sender], "Already ready");

  playersReady[msg.sender] = true;
  emit PlayerReady(msg.sender);
}

    function playersJoined() external view returns (bool) {
    return player1 != address(0) && player2 != address(0);
}

    function attack(uint index) external {
        require(gameStarted, "Game not started yet.");
        require(msg.sender == currentPlayer, "Not your turn.");

        address opponent;
        if (currentPlayer == player1) {
            opponent = player2;
        } else {
            opponent = player1;
        }

        PlayerData storage opponentData = playersData[opponent];
        uint shipIndex = opponentData.grid[index];

        bool hit = false;
        bool sunk = false;

        if (shipIndex > 0) {
            hit = true;
            Ship storage ship = opponentData.ships[shipIndex - 1];
            ship.hitCount += 1;

            if (ship.hitCount == ship.size) {
                sunk = true;
                opponentData.shipsRemaining -= 1;

                if (opponentData.shipsRemaining == 0) {
                    emit GameOver(currentPlayer);
                    return;
                }
            }
        }

        emit AttackResult(msg.sender, index, hit, sunk);

        if (!hit) {
            currentPlayer = opponent;
            emit Turn(currentPlayer);
        }
    }
}
