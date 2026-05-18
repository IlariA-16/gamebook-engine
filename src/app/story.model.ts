export interface Choice {
  text: string;
  nextNodeId: string;
  requiredItem?: string; // ID dell'oggetto necessario per fare questa scelta
}

export interface StoryNode {
  id: string;
  title?: string;
  text: string;
  choices: Choice[];
  isEnding: boolean;
  itemToGive?: string;   // ID dell'oggetto che il giocatore raccoglie in questa scena
  hpModifier?: number;   // NUOVO: es. -3 per un danno, +2 per una cura
}
