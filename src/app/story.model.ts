export interface Choice {
  text: string;
  nextNodeId: string;
}

export interface StoryNode {
  id: string;
  title?: string;
  text: string;
  choices: Choice[];
  isEnding: boolean;
}
