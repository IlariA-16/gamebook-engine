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
  private currentHp: number = 10;   // Salute massima iniziale (NUOVO)
  
  // Gestisce lo stato del nodo attuale e notifica i componenti quando cambia
  private currentNodeSubject = new BehaviorSubject<StoryNode | null>(null);
  public currentNode$: Observable<StoryNode | null> = this.currentNodeSubject.asObservable();

  // Gestisce lo stato dell'inventario e notifica l'interfaccia utente
  private inventorySubject = new BehaviorSubject<string[]>([]);
  public inventory$: Observable<string[]> = this.inventorySubject.asObservable();

  // Gestisce lo stato della salute (HP) e notifica l'interfaccia utente (NUOVO)
  private hpSubject = new BehaviorSubject<number>(10);
  public hp$: Observable<number> = this.hpSubject.asObservable();

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
      // 1. Se il nodo attuale assegna un oggetto, lo aggiungiamo all'inventario
      if (targetNode.itemToGive && !this.inventory.includes(targetNode.itemToGive)) {
        this.inventory.push(targetNode.itemToGive);
        this.inventorySubject.next([...this.inventory]); // Notifica la UI
      }

      // 2. Gestione Punti Vita (HP) (NUOVO)
      if (targetNode.hpModifier) {
        this.currentHp += targetNode.hpModifier;
        if (this.currentHp > 10) this.currentHp = 10; // Non supera il limite massimo
        
        if (this.currentHp <= 0) {
          this.currentHp = 0;
          this.hpSubject.next(this.currentHp);
          this.triggerDeathNode(targetNode.title || 'Pericolo');
          return; // Ferma il gioco, l'utente è morto
        }
        this.hpSubject.next(this.currentHp);
      }
      
      this.currentNodeSubject.next(targetNode);
    } else {
      console.error(`Nodo con ID "${nodeId}" non trovato nella storia.`);
    }
  }

  // Genera istantaneamente una schermata di Game Over personalizzata per fine salute (NUOVO)
  private triggerDeathNode(scenaMorte: string): void {
    const deathNode: StoryNode = {
      id: 'morte_hp',
      title: 'La Fine del Viaggio',
      text: `Durante gli eventi accaduti in "${scenaMorte}", le tue ferite si rivelano troppo gravi. Ti accasci al suolo privo di forze. La tua salute è arrivata a 0.`,
      choices: [],
      isEnding: true
    };
    this.currentNodeSubject.next(deathNode);
  }

  // Controlla se il giocatore possiede un determinato oggetto
  public hasItem(itemName: string): boolean {
    return this.inventory.includes(itemName);
  }

  // Riavvia la storia dall'inizio, svuota l'inventario e resetta gli HP
  public restartGame(): void {
    this.inventory = [];
    this.currentHp = 10; // Resetta gli HP al massimo (NUOVO)
    this.inventorySubject.next([]);
    this.hpSubject.next(this.currentHp); // Notifica la UI (NUOVO)
    this.goToNode('intro');
  }
}
