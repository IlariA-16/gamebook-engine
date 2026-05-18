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
  combatLog$;
  history$;
  selectedClass$; // <-- AGGIUNGI QUESTO PER RISOLVERE L'ERRORE IN APP.HTML

  constructor(public storyService: StoryService) {
    this.currentNode$ = this.storyService.currentNode$;
    this.inventory$ = this.storyService.inventory$;
    this.hp$ = this.storyService.hp$;
    this.lastDiceRoll$ = this.storyService.lastDiceRoll$;
    this.combatLog$ = this.storyService.combatLog$;
    this.history$ = this.storyService.history$;
    this.selectedClass$ = this.storyService.selectedClass$; // <-- AGGANCIA LA CLASSE AL SERVIZIO
  }

  // <-- AGGIUNGI QUESTA FUNZIONE PER IL CLICK SULLE SCHEDE
  chooseClass(className: string): void {
    this.storyService.selectClass(className);
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

  // Gestisce il click sul pulsante d'attacco a turni
  onAttack(): void {
    this.storyService.executeCombatTurn();
  }

  // Gestisce il click sul bottone di riavvio
  restart(): void {
    this.storyService.restartGame();
  }
}
