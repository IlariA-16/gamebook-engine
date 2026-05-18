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
  // Assegniamo direttamente l'observable dal servizio
  currentNode$;

  constructor(private story: StoryService) {
    this.currentNode$ = this.story.currentNode$;
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
