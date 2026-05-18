export interface Choice {
  text: string;
  nextNodeId: string;
  requiredItem?: string;
}

export interface DiceChallenge {
  targetScore: number;
  successNodeId: string;
  failureNodeId: string;
}

// NUOVO: Struttura per definire un combattimento
export interface EnemyCombat {
  name: string;          // Nome del mostro (es: "Goblin")
  hp: number;            // Punti vita del mostro (es: 8)
  damage: number;        // Danno fisso che infligge il mostro (es: 2)
  successNodeId: string; // Dove si va se si vince
}

export interface StoryNode {
  id: string;
  title?: string;
  text: string;
  choices: Choice[];
  isEnding: boolean;
  itemToGive?: string;
  hpModifier?: number;
  diceChallenge?: DiceChallenge;
  combat?: EnemyCombat; // NUOVO: Combattimento opzionale nel nodo
}
