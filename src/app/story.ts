import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { StoryNode } from './story.model';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private storyNodes: StoryNode[] = [];
  private inventory: string[] = []; // Array interno per gli oggetti posseduti
  
  // Gestisce lo stato del nodo attuale e notifica i componenti quando cambia
  private currentNodeSubject = new BehaviorSubject<StoryNode | null>(null);
  public currentNode$: Observable<StoryNode | null> = this.currentNodeSubject.asObservable();

  // Gestisce lo stato dell'inventario e notifica l'interfaccia utente
  private inventorySubject = new BehaviorSubject<string[]>([]);
  public inventory$: Observable<string[]> = this.inventorySubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStory();
  }

  // Carica il file JSON gigante dalla cartella public
  private loadStory(): void {
    this.http.get<StoryNode[]>('story-data.json').subscribe({
      next: (nodes) => {
        this.storyNodes = nodes;
        this.restartGame(); // Inizia o pulisce il gioco all'avvio
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
      // Se il nodo attuale assegna un oggetto, lo aggiungiamo all'inventario
      if (targetNode.itemToGive && !this.inventory.includes(targetNode.itemToGive)) {
        this.inventory.push(targetNode.itemToGive);
        this.inventorySubject.next([...this.inventory]); // Notifica la UI
      }
      
      this.currentNodeSubject.next(targetNode);
    } else {
      console.error(`Nodo con ID "${nodeId}" non trovato nella storia.`);
    }
  }

  // Controlla se il giocatore possiede un determinato oggetto
  public hasItem(itemName: string): boolean {
    return this.inventory.includes(itemName);
  }

  // Riavvia la storia dall'inizio e svuota l'inventario
  public restartGame(): void {
    this.inventory = [];
    this.inventorySubject.next([]);
    this.goToNode('intro');
  }
}
