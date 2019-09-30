import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { UUID } from '@scion/toolkit/util';

@Component({
  selector: 'app-outlets',
  templateUrl: './outlets.component.html',
  styleUrls: ['./outlets.component.scss'],
})
export class OutletsComponent {

  public outletIds$: Observable<string[]>;

  constructor(route: ActivatedRoute) {
    this.outletIds$ = route.paramMap.pipe(map(params => {
      if (params.get('names')) {
        return params.get('names').split(',');
      }
      else if (params.get('count')) {
        return new Array(coerceNumberProperty(params.get('count'))).map(() => UUID.randomUUID());
      }
      else {
        return [UUID.randomUUID()];
      }
    }));
  }
}
