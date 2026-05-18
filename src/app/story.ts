import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { StoryNode } from './story.model';



@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private storyNodes: StoryNode[] = [];
  
  // Gestisce lo stato del nodo attuale e notifica i componenti quando cambia
  private currentNodeSubject = new BehaviorSubject<StoryNode | null>(null);
  public currentNode$: Observable<StoryNode | null> = this.currentNodeSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStory();
  }

  // Carica il file JSON gigante dalla cartella public
  private loadStory(): void {
    this.http.get<StoryNode[]>('story-data.json').subscribe({
      next: (nodes) => {
        this.storyNodes = nodes;
        // Fai partire il gioco dal primo nodo ("intro")
        this.goToNode('intro');
      },
      error: (err) => {
        console.error('Errore nel caricamento della storia:', err);
      }
    });
  }

  // Sposta il giocatore su un nuovo bivio tramite il suo ID
  public goToNode(nodeId: string): void {
    const targetNode = this.storyNodes.find(node => node.id === nodeId);
    if (targetNode) {
      this.currentNodeSubject.next(targetNode);
    } else {
      console.error(`Nodo con ID "${nodeId}" non trovato nella storia.`);
    }
  }

  // Riavvia la storia dall'inizio
  public restartGame(): void {
    this.goToNode('intro');
  }
}
