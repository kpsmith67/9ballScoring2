import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, Params } from '@angular/router';

@Component({
  selector: 'app-edit-details',
  templateUrl: './edit-details.component.html',
  styleUrls: ['./edit-details.component.css']
})
export class EditDetailsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location) {}

  ngOnInit() {
    this.route.queryParams.subscribe(this.paramsUpdate.bind(this));
  }

  params: Params = {};
  l = ['3', '3'];
  p = ['', ''];
  hasScore = false;

  getString(key: string, v: string): string {
    if (!(key in this.params)) {
      return v;
    }
    return this.params[key];
  }

  paramsUpdate(params: Params) {
    this.params = params;
    this.hasScore = (this.getString('t', '') != '')
    this.p[0] = this.getString('p0', '');
    this.p[1] = this.getString('p1', '');
    this.l[0] = this.getString('l0', '3');
    this.l[1] = this.getString('l1', '3');
  }

  getParams() {
    let params = {
      l0: this.l[0],
      l1: this.l[1]
    };
    if (this.p[0] != '') {
      params['p0'] = this.p[0];
    }
    if (this.p[1] != '') {
      params['p1'] = this.p[1];
    }
    return params;
  }

  done() {
    this.router.navigate([''], {
      queryParams: this.getParams(),
      queryParamsHandling: 'merge'
    });
  }

  reset() {
    this.router.navigate(['edit'], {
      queryParams: this.getParams()
    })
  }

  undo() {
    this.location.back();
  }
}
