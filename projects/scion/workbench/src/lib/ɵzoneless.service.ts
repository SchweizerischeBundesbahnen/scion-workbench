import {inject, Injectable, ɵZONELESS_ENABLED} from '@angular/core';

@Injectable({providedIn: 'root'})
export class ɵZoneless {

  public enabled = inject(ɵZONELESS_ENABLED, {optional: true}) ?? false;

}
