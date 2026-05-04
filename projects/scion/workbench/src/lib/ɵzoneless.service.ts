import {inject, Injectable, ɵZONELESS_ENABLED} from '@angular/core';

@Injectable({providedIn: 'root'})
export class ɵZoneless {

  /**
   * Property used to indicate if zoneless is enabled via provideZonelessChangeDetection() (default behavior for Angular 21+).
   */
  public enabled = inject(ɵZONELESS_ENABLED, {optional: true}) ?? false;

}
