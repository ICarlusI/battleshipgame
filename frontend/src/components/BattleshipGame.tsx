import React, { useEffect, useState } from 'react';
import useGetContractBattle from "../utils/useGetContractBattle";
import { Box, Grid, Stack, styled } from "@mui/material";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";

import { Ship } from "../interfaces/Ship";
import { PlayerData } from "../interfaces/PlayerData";


function BattleshipGame() {
  const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; // Adresse du contrat déployé
  const contract = useGetContractBattle(contractAddress);
    const [playerData, setPlayerData] = useState<PlayerData>({
      grid: [],
      ships: [],
      ready: false,
      shipsRemaining: 0,
    });
    const DRAG_TYPE = "ship";

const DraggableShip: React.FC<{ ship: Ship }> = ({ ship }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: DRAG_TYPE,
    item: { ship },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }}
    >
      {ship.shipType}
    </div>
  );
};

const DroppableCell: React.FC<{
  index: number;
  onDrop: (ship: Ship, index: number) => void;
}> = ({ index, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: DRAG_TYPE,
    drop: (item: { ship: Ship }) => onDrop(item.ship, index),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  // Utilisez la couleur verte pour les cases où les navires sont placés
  const backgroundColor = playerData.grid[index] ? "green" : "transparent";

  return (
    <div
      ref={drop}
      style={{
        width: 30,
        height: 30,
        border: "1px solid #ccc",
        backgroundColor: isOver ? "#ccc" : backgroundColor,
      }}
    />
  );
};
const [playersJoined, setPlayersJoined] = useState(false);

    const [selectedShips, setSelectedShips] = useState<Ship[]>([]);
    const [readyPlayers, setReadyPlayers] = useState(0);

    const [currentTurnPlayer, setCurrentTurnPlayer] = useState<null | string>(null);
    const [attackedCells, setAttackedCells] = useState<number[]>([]);
    const [winner, setWinner] = useState<null | string>(null);
    const [shipOrientations, setShipOrientations] = useState<{ [key: string]: boolean }>({
      
      carrier: true,
      battleship: true,
      cruiser: true,
      submarine: true,
      destroyer: true,
    });
    const Cell = styled(Box)(({ theme }) => ({
      width: 30,
      height: 30,
      boxSizing: "border-box",
      position: "relative",
    }));
    
    const AttackedCell = styled(Cell)({
      backgroundColor: "red",
    });
    
    const ShipCell = styled(Cell)({
      backgroundColor: "#2e7d32",
    });
    const availableShips: Ship[] = [
      { shipType: "carrier", size: 5 },
      { shipType: "battleship", size: 4 },
      { shipType: "cruiser", size: 3 },
      { shipType: "submarine", size: 3 },
      { shipType: "destroyer", size: 2 },
    ];

    function selectShip(ship: Ship) {
      setSelectedShips((prevSelectedShips) => [...prevSelectedShips, ship]);
    }

    async function joinGame() {
      if (!contract || playersJoined) return;
    
      const player1Address = await contract.player1();
      if (player1Address === window.ethereum.selectedAddress) {
        console.log("You are already player 1.");
        return;
      }
    
      try {
        const tx = await contract.joinGame();
        await tx.wait();
      } catch (error) {
        console.error("Error joining game:", error);
      }
    }

 async function checkPlayersJoined() {
  if (!contract) return;
  try {
    const p1 = await contract.player1();
    const p2 = await contract.player2();
    setPlayersJoined(p1 !== "0x0000000000000000000000000000000000000000" && p2 !== "0x0000000000000000000000000000000000000000");
  } catch (error) {
    console.error("Error checking players:", error);
  }
}

  async function setGridAndShips(grid: number[], ships: Ship[]) {
    if (!contract) return;
    try {
      const tx = await contract.setGridAndShips(grid, ships.map((ship) => ship.position));
      await tx.wait();
    } catch (error) {
      console.error("Error setting grid and ships:", error);
    }
  }

  function placeShip(index, ship) {
    setPlayerData((prevData) => {
      const newGrid = [...prevData.grid];
      const newShips = [...prevData.ships];
      const x = index % 10;
      const y = Math.floor(index / 10);
  
      const isHorizontal = shipOrientations[ship.shipType];
  
      // Vérifiez si le bateau est placé à l'extérieur de la grille
      if (isHorizontal && x + ship.size > 10) return prevData;
      if (!isHorizontal && y + ship.size > 10) return prevData;

      if (newShips.some((existingShip) => existingShip.shipType === ship.shipType)) {
        return prevData;
      }
  
      // Vérifiez si le bateau est placé sur un autre bateau
      for (let i = 0; i < ship.size; i++) {
        const cellIndex = isHorizontal ? index + i : index + i * 10;
        if (newGrid[cellIndex]) return prevData;
      }
  
      // Placez le bateau sur la grille et mettez à jour les navires
      for (let i = 0; i < ship.size; i++) {
        const cellIndex = isHorizontal ? index + i : index + i * 10;
        newGrid[cellIndex] = 1;
      }
  
      newShips.push({ ...ship, position: index, isHorizontal });
  
      return {
        ...prevData,
        grid: newGrid,
        ships: newShips,
      };
    });
  }
  
  async function attack(cellIndex) {
  if (!contract || playersJoined) return;
    try {
      const tx = await contract.attack(cellIndex);
      await tx.wait();
      setAttackedCells((prev) => [...prev, cellIndex]);
    } catch (error) {
      console.error("Error attacking:", error);
    }
  }

  function renderGrid() {
    const cells = [];
    const rowLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    const columnLabels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  
    cells.push(
      <Grid item>
        <Box width={30} height={30} />
      </Grid>
    );
  
    for (let col = 0; col < 10; col++) {
      cells.push(
        <Grid item key={`colLabel${col}`}>
          <Box
            width={30}
            height={30}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderBottom="1px solid #ccc"
          >
            {columnLabels[col]}
          </Box>
        </Grid>
      );
    }
  
    for (let row = 0; row < 10; row++) {
      cells.push(
        <Grid item key={`rowLabel${row}`}>
          <Box
            width={30}
            height={30}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRight="1px solid #ccc"
          >
            {rowLabels[row]}
          </Box>
        </Grid>
      );
      for (let col = 0; col < 10; col++) {
        const i = row * 10 + col;
  
        cells.push(
          <Grid item key={i}>
            <DroppableCell
              index={i}
              onDrop={(ship) => {
                placeShip(i, ship);
              }}
            />
          </Grid>
        );
      }
    }
  
    return (
      <Grid container style={{ width: 330 }}>
        {cells.map((cell, index) => (
          <React.Fragment key={index}>{cell}</React.Fragment>
        ))}
      </Grid>
    );
  }
  
  async function handleReadyClick() {
    if (!contract || !playerData.ships.every(ship => availableShips.some(availableShip => availableShip.shipType === ship.shipType))) return;
  
    try {
      const tx = await contract.setPlayerReady();
      await tx.wait();
      setReadyPlayers((prev) => prev + 1);
    } catch (error) {
      console.error("Error setting player ready:", error);
    }
  }
  

  useEffect(() => {
    if (!contract) return;

    checkPlayersJoined();
    const onTurn = (player) => {
      console.log("New turn:", player);
      setCurrentTurnPlayer(player);
    };
  
    const onAttackResult = (attacker, index, hit, sunk) => {
      console.log(`Attack result: attacker=${attacker}, index=${index}, hit=${hit}, sunk=${sunk}`);
      // Mettez à jour l'état de l'interface utilisateur ici, si nécessaire
    };

  
    const onGameOver = (winner) => {
      console.log("Game over, winner:", winner);
      setWinner(winner);
    };
  
    contract.on("Turn", onTurn);
    contract.on("AttackResult", onAttackResult);
    contract.on("GameOver", onGameOver);

    const onPlayerJoined = (player) => {
      console.log("Player joined:", player);
      setPlayersJoined(true);
    };
  
    contract.on("PlayerJoined", onPlayerJoined);

    const onPlayerReady = (player) => {
      console.log("Player ready:", player);
      setReadyPlayers((prev) => prev + 1);
    };
    
    contract.on("PlayerReady", onPlayerReady);
  
    // Nettoyez l'écouteur d'événement lorsque le composant est démonté
    return () => {
      contract.off("Turn", onTurn);
      contract.off("AttackResult", onAttackResult);
      contract.off("GameOver", onGameOver);
      contract.off("PlayerJoined", onPlayerJoined);
      contract.off("PlayerReady", onPlayerReady);


    };
    
  }, [contract]);

  // Votre logique d'affichage et d'interaction avec le contrat ici
return (
    <div>
        <button onClick={joinGame} disabled={playersJoined}>
            Rejoindre le jeu
        </button>
        <DndProvider backend={HTML5Backend}>
            <div>
                {availableShips.map((ship, index) => (
                    <div key={index}>
                        <DraggableShip ship={ship} />
                        <button
                            onClick={() => {
                                setShipOrientations({
                                    ...shipOrientations,
                                    [ship.shipType]: !shipOrientations[ship.shipType],
                                });
                            }}
                        >
                            {shipOrientations[ship.shipType] ? "Horizontal" : "Vertical"}
                        </button>
                    </div>
                ))}
            </div>
            {renderGrid()}
        </DndProvider>
        {currentTurnPlayer && (
            <p>
                C'est au tour de {currentTurnPlayer === contract.player1() ? "joueur 1" : "joueur 2"}.
            </p>
        )}
        {winner && (
            <p>
                Le {winner === contract.player1() ? "joueur 1" : "joueur 2"} a gagné la partie !
            </p>
        )}
        <div>
            {/* Votre contenu de jeu ici */}
            {readyPlayers < 2 && (
                <div>
                    <button onClick={handleReadyClick} disabled={playerData.ships.length !== availableShips.length}>
                        Prêt
                    </button>
                    <p>
                        {readyPlayers}/2
                    </p>
                </div>
            )}
            {readyPlayers === 2 && (
                <p>La partie peut commencer.</p>
            )}
        </div>
    </div>
);
}
export default BattleshipGame;
