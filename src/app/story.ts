import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { StoryNode, EnemyCombat } from './story.model';

@Injectable({
  providedIn: 'root'
})
export class StoryService {
  private storyNodes: StoryNode[] = [];
  private inventory: string[] = [];
  private currentHp: number = 10;
  private maxHp: number = 10; // Diventa dinamico in base alla classe scelta
  private history: string[] = [];
  
  public activeCombat: EnemyCombat | null = null;
  private combatLogSubject = new BehaviorSubject<string>('');
  public combatLog$: Observable<string> = this.combatLogSubject.asObservable();

  private currentNodeSubject = new BehaviorSubject<StoryNode | null>(null);
  public currentNode$: Observable<StoryNode | null> = this.currentNodeSubject.asObservable();

  private inventorySubject = new BehaviorSubject<string[]>([]);
  public inventory$: Observable<string[]> = this.inventorySubject.asObservable();

  private hpSubject = new BehaviorSubject<number>(10);
  public hp$: Observable<number> = this.hpSubject.asObservable();

  private lastDiceRollSubject = new BehaviorSubject<number>(-1);
  public lastDiceRoll$: Observable<number> = this.lastDiceRollSubject.asObservable();

  private historySubject = new BehaviorSubject<string[]>([]);
  public history$: Observable<string[]> = this.historySubject.asObservable();

  // Traccia la classe selezionata
  private selectedClassSubject = new BehaviorSubject<string>('');
  public selectedClass$: Observable<string> = this.selectedClassSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStory();
  }

  private loadStory(): void {
    this.http.get<StoryNode[]>('story-data.json').subscribe({
      next: (nodes) => {
        this.storyNodes = nodes;
        this.restartGame();
      },
      error: (err) => console.error('Errore nel caricamento della storia:', err)
    });
  }

  // Applica i bonus della classe scelta
  public selectClass(className: string): void {
    this.selectedClassSubject.next(className);
    this.inventory = [];
    this.history = [];
    
    if (className === 'Guerriero') {
      this.maxHp = 14;
      this.currentHp = 14;
    } else {
      this.maxHp = 10;
      this.currentHp = 10;
    }

    if (className === 'Mago') {
      this.inventory.push('Pergamena del Sole');
    }

    this.inventorySubject.next([...this.inventory]);
    this.hpSubject.next(this.currentHp);
    this.historySubject.next([]);
    this.goToNode('intro');
  }

  public goToNode(nodeId: string): void {
    const targetNode = this.storyNodes.find(node => node.id === nodeId);
    if (targetNode) {
      this.lastDiceRollSubject.next(-1);
      this.combatLogSubject.next('');

      if (targetNode.combat) {
        this.activeCombat = { ...targetNode.combat };
      } else {
        this.activeCombat = null;
      }

      if (targetNode.itemToGive && !this.inventory.includes(targetNode.itemToGive)) {
        this.inventory.push(targetNode.itemToGive);
        this.inventorySubject.next([...this.inventory]);
      }

      if (targetNode.hpModifier) {
        this.modifyHp(targetNode.hpModifier, targetNode.title || 'Pericolo');
      }

      if (targetNode.title && targetNode.id !== 'morte_hp') {
        this.history.push(targetNode.title);
        this.historySubject.next([...this.history]);
      }
      
      this.currentNodeSubject.next(targetNode);
    } else {
      console.error(`Nodo con ID "${nodeId}" non trovato nella storia.`);
    }
  }

  public executeCombatTurn(): void {
    if (!this.activeCombat) return;

    const playerRoll = Math.floor(Math.random() * 6) + 1;
    this.lastDiceRollSubject.next(playerRoll);
    this.activeCombat.hp -= playerRoll;

    let log = `⚔️ Attacchi ${this.activeCombat.name}: lanci il dado e infliggi ${playerRoll} danni!`;

    if (this.activeCombat.hp <= 0) {
      this.activeCombat.hp = 0;
      this.combatLogSubject.next(`${log}\n🏆 Hai sconfitto il nemico!`);
      setTimeout(() => this.goToNode(this.activeCombat!.successNodeId), 1500);
      return;
    }

    this.modifyHp(-this.activeCombat.damage, this.activeCombat.name);
    log += `\n💥 Il ${this.activeCombat.name} risponde al colpo e ti infligge ${this.activeCombat.damage} danni!`;
    
    if (this.currentHp > 0) {
      log += `\n${this.activeCombat.name} resiste con ${this.activeCombat.hp} HP rimasti.`;
    }
    this.combatLogSubject.next(log);
  }

  private modifyHp(amount: number, source: string): void {
    this.currentHp += amount;
    if (this.currentHp > this.maxHp) this.currentHp = this.maxHp;
    
    if (this.currentHp <= 0) {
      this.currentHp = 0;
      this.hpSubject.next(this.currentHp);
      this.triggerDeathNode(source);
      return;
    }
    this.hpSubject.next(this.currentHp);
  }

  public rollDice(challenge: { targetScore: number; successNodeId: string; failureNodeId: string }): void {
    let roll = Math.floor(Math.random() * 6) + 1;
    
    // Il Ladro ottiene +2 fisso al tiro di dado
    if (this.selectedClassSubject.value === 'Ladro') {
      roll += 2;
    }
    
    this.lastDiceRollSubject.next(roll);
    setTimeout(() => {
      if (roll >= challenge.targetScore) this.goToNode(challenge.successNodeId);
      else this.goToNode(challenge.failureNodeId);
    }, 1200);
  }

  private triggerDeathNode(source: string): void {
    this.activeCombat = null;
    const deathNode: StoryNode = {
      id: 'morte_hp',
      title: 'La Fine del Viaggio',
      text: `Durante lo scontro o l'evento legato a "${source}", le tue ferite si rivelano troppo gravi. Cadi a terra privo di forze.`,
      choices: [],
      isEnding: true
    };
    this.currentNodeSubject.next(deathNode);
  }

  public hasItem(itemName: string): boolean {
    return this.inventory.includes(itemName);
  }

  public restartGame(): void {
    this.selectedClassSubject.next(''); // Forza la scelta della classe a inizio partita
    this.inventory = [];
    this.currentHp = 10;
    this.maxHp = 10;
    this.history = [];
    this.activeCombat = null;
    this.inventorySubject.next([]);
    this.hpSubject.next(this.currentHp);
    this.historySubject.next([]);
    this.lastDiceRollSubject.next(-1);
    this.combatLogSubject.next('');
    this.currentNodeSubject.next(null);
  }
}
