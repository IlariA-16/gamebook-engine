export interface Choice {
  text: string;
  nextNodeId: string;
  requiredItem?: string; // ID dell'oggetto necessario per fare questa scelta
}

export interface DiceChallenge {
  targetScore: number;     // Punteggio minimo da raggiungere (es: 4)
  successNodeId: string;   // ID del nodo in caso di vittoria
  failureNodeId: string;   // ID del nodo in caso di fallimento
}

export interface StoryNode {
  id: string;
  title?: string;
  text: string;
  choices: Choice[];
  isEnding: boolean;
  itemToGive?: string;     // ID dell'oggetto che il giocatore raccoglie in questa scena
  hpModifier?: number;     // Modificatore salute (danno o cura)
  diceChallenge?: DiceChallenge; // NUOVO: Configurazione della sfida con i dadi
}
