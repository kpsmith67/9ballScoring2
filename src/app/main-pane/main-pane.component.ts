import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

var partScore = [
  [],
  [0,  3,  4,  5,  7,  8,  9, 11, 12, 14],
  [0,  4,  6,  8,  9, 11, 13, 15, 17, 19],
  [0,  5,  7, 10, 12, 15, 17, 20, 22, 25],
  [0,  6,  9, 12, 15, 19, 22, 25, 28, 31],
  [0,  7, 11, 15, 19, 23, 27, 30, 34, 38],
  [0,  9, 13, 18, 23, 28, 32, 37, 41, 46],
  [0, 11, 16, 22, 27, 33, 38, 44, 50, 55],
  [0, 14, 20, 27, 33, 40, 46, 53, 59, 65],
  [0, 18, 25, 32, 39, 47, 54, 61, 68, 75],
];

@Component({
  selector: 'app-main-pane',
  animations: [
    trigger('activePlayer', [
      state(
        'active',
        style({
          height: '65vh'
        })
      ),
      state(
        'inactive',
        style({
          height: '35vh'
        })
      ),
      transition('active <=> inactive', [animate('0.2s')])
    ]),
    trigger('deltaAdder', [
      transition(':enter', [
        style({ opacity: 1.0, top: '-1vh' }),
        animate('200ms', style({ opacity: 0.0, top: '-7vh' }))
      ])
    ])
  ],
  templateUrl: './main-pane.component.html',
  styleUrls: ['./main-pane.component.css']
})
export class MainPaneComponent implements OnInit {
  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private location: Location) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(this.paramsUpdate.bind(this));
  }


  isTopActive = true;
  params: Params = {};

  // rack level stats
  rackInnings = 0;
  balls = 9;
  deadBalls = 0;
  rs = [0, 0];
  t = ['', ''];
  justKilled = false;

  // game level stats. Only incremented when rack is complete.
  innings = 0;
  s = [0, 0];
  l = [0, 0];
  p = ["Player 1", "Player 2"];

  // Plus and minus sign deltas to players' scores.
  score_adders = [[], []];
  // Count of how many delta animations have finished. Once they all finish, we clear the array.
  dead_count = [0, 0];

  deltaDone(p) {
    this.dead_count[p] += 1;
    if (this.dead_count[p] >= this.score_adders[p].length) {
      this.score_adders[p] = [];
      this.dead_count[p] = 0;
    }
  }

  max(l: number) {
    if (l < 1 || l > 9) {
      return 0;
    }
    return partScore[l][9];
  }

  part(pl: number) {
    let l = this.l[pl];
    let s = this.s[pl] + this.rs[pl];
    if (l < 1 || l > 9) {
      return 0;
    }
    let ps = 0;
    while (partScore[l][ps+1] <= s) {
      ps += 1;
      if (ps == 9) {
        return 20-this.part(1-pl);
      }
    }
    return ps;
  }

  next(pl: number) {
    if (this.gameOver()) {
      return "(game over)";
    }

    let l = this.l[pl];
    if (l < 1 || l > 9) {
      return "";
    }
    let ps = 0;
    let s = this.s[pl] + this.rs[pl];
    while (partScore[l][ps+1] <= s) {
      ps += 1;
    }
    return "(" + (partScore[l][ps+1] - s) + " for next)";
  }

  isMaxScore(l, score) {
    if (l < 1 || l > 9) {
      return true;
    }
    return partScore[l][9] <= score;
  }

  gameOver() {
    return (
      this.isMaxScore(this.l[0], this.s[0]+this.rs[0]) ||
      this.isMaxScore(this.l[1], this.s[1]+this.rs[1]));
  }

  halfSelect(isTop: boolean) {
    if (this.balls > 0 && isTop !== this.isTopActive) {
      if (!this.isTopActive) {
        this.rackInnings += 1;
      }
      this.router.navigate([''], {
          queryParams: {
            t: isTop ? 'T' : 'F',
            k: 'F',
            ri: this.rackInnings,
          }, queryParamsHandling: "merge" })
    }
  }

  player() {
    return this.isTopActive ? 0 : 1;
  }


  ball() {
    if (this.balls > 1) {
      this.rs[this.player()] += 1;
      this.score_adders[this.player()].push("+1");
      this.balls -= 1;
      this.router.navigate([''], {
        queryParams: {
          rs0: this.rs[0],
          rs1: this.rs[1],
          b: this.balls,
        }, queryParamsHandling: "merge" })
    }
  }

  ballDisabled () {
    return this.balls <= 1 || this.gameOver() || this.justKilled;
  }


  lastBall() {
    if (this.balls > 0) {
      this.deadBalls += this.balls - 1;
      let pl = this.player();
      this.rs[pl] += 2;
      this.score_adders[pl].push("+2");
      if (this.l[pl] >= 1 && this.l[pl] <= 9) {
        if (partScore[this.l[pl]][9] < this.s[pl] + this.rs[pl]) {
          this.rs[pl] = partScore[this.l[pl]][9] - this.s[pl];
        }
      }
      this.balls = 0;
      this.router.navigate([''], {
        queryParams: {
          rs0: this.rs[0],
          rs1: this.rs[1],
          db: this.deadBalls,
          b: this.balls,
        }, queryParamsHandling: "merge" })
    }
  }

  lastBallDisabled() {
    return this.balls == 0 || this.gameOver() || this.justKilled;
  }


  deadBall() {
    if (this.balls > 1) {
      this.balls -= 1;
      this.deadBalls += 1;
      this.router.navigate([''], {
        queryParams: {
          b: this.balls,
          db: this.deadBalls,
          k: 'T',
        }, queryParamsHandling: "merge" })
    }
  }

  deadDisabled () {
    return this.balls <= 1 || this.gameOver();
  }


  maxTimeouts(p: number) {
    return this.l[p] < 4 ? 2 : 1;
  }

  timeout() {
    let pl = this.player();
    if (this.t[pl].length < this.maxTimeouts(pl)) {
      this.t[pl] += 'T';
      this.router.navigate([''], {
        queryParams: {
          t0: this.t[0],
          t1: this.t[1],
        }, queryParamsHandling: "merge" })
    }
  }

  timeoutDisabled() {
    let pl = this.player();

    return this.balls == 0 || this.t[pl].length >= this.maxTimeouts(pl);
  }


  newRack() {
    if (this.balls == 0) {
      this.balls = 9;
      this.s[0] += this.rs[0];
      this.rs[0] = 0;
      this.s[1] += this.rs[1];
      this.rs[1] = 0; 
      this.innings += this.rackInnings;
      this.rackInnings = 0;
      this.deadBalls = 0;
      this.router.navigate([''], {
        queryParams: {
          s0: this.s[0],
          rs0: this.rs[0],
          s1: this.s[1],
          rs1: this.rs[1],
          db: this.deadBalls,
          i: this.innings,
          ri: this.rackInnings,
          b: this.balls,
          t0: '',
          t1: '',
        }, queryParamsHandling: "merge" })
    }
  }

  newRackDisabled() {
    return this.balls > 0 || this.gameOver();
  }


  undo() {
    this.location.back();
  }

  redo() {
    this.location.forward();
  }

  edit() {
    this.router.navigate(['edit'], {
      queryParamsHandling: "merge" })
  }

  getBoolean(key: string, v: boolean): boolean {
    if (!(key in this.params)) {
      return v;
    }
    return this.params[key] == "T";
  }

  getInteger(key: string, v: number): number {
    if (!(key in this.params)) {
      return v;
    }
    return parseInt(this.params[key]);
  }

  getString(key: string, v: string): string {
    if (!(key in this.params)) {
      return v;
    }
    return this.params[key];
  }

  paramsUpdate(params: Params) {
    let old_p0_score = this.rs[0] + this.s[0];
    let old_p1_score = this.rs[1] + this.s[1];

    this.params = params;
    this.isTopActive = this.getBoolean('t', true);
    this.innings = this.getInteger('i', 0);
    this.rackInnings = this.getInteger('ri', 0);
    this.s[0] = this.getInteger('s0', 0);
    this.s[1] = this.getInteger('s1', 0);
    this.rs[0] = this.getInteger('rs0', 0);
    this.rs[1] = this.getInteger('rs1', 0);
    this.balls = this.getInteger('b', 9);
    this.deadBalls = this.getInteger('db', 0);
    this.justKilled = this.getBoolean('k', false);
    this.p[0] = this.getString('p0', 'Player 1');
    this.p[1] = this.getString('p1', 'Player 2');
    this.l[0] = this.getInteger('l0', 3);
    this.l[1] = this.getInteger('l1', 3);
    this.t[0] = this.getString('t0', '');
    this.t[1] = this.getString('t1', '');

    let p0_score = this.rs[0] + this.s[0];
    let p1_score = this.rs[1] + this.s[1];

    if (p0_score < old_p0_score) {
      this.score_adders[0].push(p0_score - old_p0_score);
    }
    if (p1_score < old_p1_score) {
      this.score_adders[1].push(p1_score - old_p1_score);
    }
    if (p0_score > old_p0_score) {
      this.score_adders[0].push('+' + (p0_score - old_p0_score));
    }
    if (p1_score > old_p1_score) {
      this.score_adders[1].push('+' + (p1_score - old_p1_score));
    }
  }

  activeState(isActive: boolean): string {
    return isActive ? 'active' : 'inactive';
  }

  bottomClass(): string {
    return this.isTopActive ? 'bottom' : 'bottom active';
  }

  topClass(): string {
    return this.isTopActive ? 'top active' : 'top';
  }

  rackBalls(): string {
    let s = ""
    if (this.balls > 1) {
      s = this.balls + " balls";
    } else if (this.balls == 1) {
      s = "last ball"
    } else {
      s = "done"
    }
    if (this.deadBalls) {
      s += " (" + this.deadBalls + " dead)"
    }
    return s;
  }
}
