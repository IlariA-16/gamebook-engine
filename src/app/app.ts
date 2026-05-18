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
  // Dichiariamo solo le variabili in alto senza assegnarle
  currentNode$;
  inventory$;
  hp$;

  // Le assegniamo qui dentro, dove "storyService" è finalmente pronto e utilizzabile!
  constructor(private storyService: StoryService) {
    this.currentNode$ = this.storyService.currentNode$;
    this.inventory$ = this.storyService.inventory$;
    this.hp$ = this.storyService.hp$;
  }

  // Verifica se il giocatore soddisfa i requisiti della scelta
  canChoose(requiredItem?: string): boolean {
    if (!requiredItem) return true; 
    return this.storyService.hasItem(requiredItem);
  }

  // Gestisce il click del giocatore su una scelta
  makeChoice(nextNodeId: string): void {
    this.storyService.goToNode(nextNodeId);
  }

  // Gestisce il click sul bottone di riavvio
  restart(): void {
    this.storyService.restartGame();
  }
}
