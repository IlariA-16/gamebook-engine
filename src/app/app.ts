import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryService } from './story';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  currentNode$;
  inventory$;
  hp$;
  lastDiceRoll$; // <-- AGGIUNGI QUESTO PER IL DADO

  constructor(private storyService: StoryService) {
    this.currentNode$ = this.storyService.currentNode$;
    this.inventory$ = this.storyService.inventory$;
    this.hp$ = this.storyService.hp$;
    this.lastDiceRoll$ = this.storyService.lastDiceRoll$; // <-- INIZIALIZZA IL DADO
  }

  // Verifica se il giocatore soddisfa i requisiti della scelta
  canChoose(requiredItem?: string): boolean {
    if (!requiredItem) return true; 
    return this.storyService.hasItem(requiredItem);
  }

  // Gestisce il click del giocatore su una scelta normale
  makeChoice(nextNodeId: string): void {
    this.storyService.goToNode(nextNodeId);
  }

  // NUOVO: Gestisce il lancio del dado passandogli la sfida corrente
  onRollDice(challenge: any): void {
    this.storyService.rollDice(challenge);
  }

  // Gestisce il click sul bottone di riavvio
  restart(): void {
    this.storyService.restartGame();
  }
}
