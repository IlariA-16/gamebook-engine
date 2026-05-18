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
  // Espone lo stato della scena e dell'inventario direttamente al file HTML
  currentNode$;
  inventory$;

  constructor(private story: StoryService) {
    this.currentNode$ = this.story.currentNode$;
    this.inventory$ = this.story.inventory$;
  }

  // Verifica se il giocatore soddisfa i requisiti della scelta
  canChoose(requiredItem?: string): boolean {
    if (!requiredItem) return true; // Scelta libera
    return this.story.hasItem(requiredItem);
  }

  // Gestisce il click del giocatore su una scelta
  makeChoice(nextNodeId: string): void {
    this.story.goToNode(nextNodeId);
  }

  // Gestisce il click sul bottone di riavvio
  restart(): void {
    this.story.restartGame();
  }
}
