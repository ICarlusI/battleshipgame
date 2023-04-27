import { Ship } from "./ship";

export interface PlayerData {
  grid: number[];
  ships: Ship[];
  ready: boolean;
  shipsRemaining: number;
}
