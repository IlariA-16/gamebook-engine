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
  lastDiceRoll$;
  combatLog$; // <-- AGGIUNGI QUESTO PER IL COMBATTIMENTO

  // Impostiamo public per consentire all'HTML di accedere a activeCombat
  constructor(public storyService: StoryService) {
    this.currentNode$ = this.storyService.currentNode$;
    this.inventory$ = this.storyService.inventory$;
    this.hp$ = this.storyService.hp$;
    this.lastDiceRoll$ = this.storyService.lastDiceRoll$;
    this.combatLog$ = this.storyService.combatLog$; // <-- INIZIALIZZA IL LOG DI BATTAGLIA
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

  // Gestisce il lancio del dado passandogli la sfida corrente
  onRollDice(challenge: any): void {
    this.storyService.rollDice(challenge);
  }

  // NUOVO: Gestisce il click sul pulsante d'attacco a turni
  onAttack(): void {
    this.storyService.executeCombatTurn();
  }

  // Gestisce il click sul bottone di riavvio
  restart(): void {
    this.storyService.restartGame();
  }
}
