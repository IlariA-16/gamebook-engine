import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { StoryNode } from './story.model';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private storyNodes: StoryNode[] = [];
  private inventory: string[] = [];
  private currentHp: number = 10;
  
  private currentNodeSubject = new BehaviorSubject<StoryNode | null>(null);
  public currentNode$: Observable<StoryNode | null> = this.currentNodeSubject.asObservable();

  private inventorySubject = new BehaviorSubject<string[]>([]);
  public inventory$: Observable<string[]> = this.inventorySubject.asObservable();

  private hpSubject = new BehaviorSubject<number>(10);
  public hp$: Observable<number> = this.hpSubject.asObservable();

  // Gestisce il risultato del dado (-1 significa nessun lancio effettuato)
  private lastDiceRollSubject = new BehaviorSubject<number>(-1);
  public lastDiceRoll$: Observable<number> = this.lastDiceRollSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStory();
  }

  private loadStory(): void {
    this.http.get<StoryNode[]>('story-data.json').subscribe({
      next: (nodes) => {
        this.storyNodes = nodes;
        this.restartGame();
      },
      error: (err) => {
        console.error('Errore nel caricamento della storia:', err);
      }
    });
  }

  public goToNode(nodeId: string): void {
    const targetNode = this.storyNodes.find(node => node.id === nodeId);
    if (targetNode) {
      // Resetta il dado ogni volta che si cambia capitolo
      this.lastDiceRollSubject.next(-1);

      if (targetNode.itemToGive && !this.inventory.includes(targetNode.itemToGive)) {
        this.inventory.push(targetNode.itemToGive);
        this.inventorySubject.next([...this.inventory]);
      }

      if (targetNode.hpModifier) {
        this.currentHp += targetNode.hpModifier;
        if (this.currentHp > 10) this.currentHp = 10;
        
        if (this.currentHp <= 0) {
          this.currentHp = 0;
          this.hpSubject.next(this.currentHp);
          this.triggerDeathNode(targetNode.title || 'Pericolo');
          return;
        }
        this.hpSubject.next(this.currentHp);
      }
      
      this.currentNodeSubject.next(targetNode);
    } else {
      console.error(`Nodo con ID "${nodeId}" non trovato nella storia.`);
    }
  }

  // Lancia il dado ed esegue il re-indirizzamento dopo 1.2 secondi
  public rollDice(challenge: { targetScore: number; successNodeId: string; failureNodeId: string }): void {
    const roll = Math.floor(Math.random() * 6) + 1;
    this.lastDiceRollSubject.next(roll);

    setTimeout(() => {
      if (roll >= challenge.targetScore) {
        this.goToNode(challenge.successNodeId);
      } else {
        this.goToNode(challenge.failureNodeId);
      }
    }, 1200);
  }

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

  public hasItem(itemName: string): boolean {
    return this.inventory.includes(itemName);
  }

  public restartGame(): void {
    this.inventory = [];
    this.currentHp = 10;
    this.inventorySubject.next([]);
    this.hpSubject.next(this.currentHp);
    this.lastDiceRollSubject.next(-1);
    this.goToNode('intro');
  }
}
