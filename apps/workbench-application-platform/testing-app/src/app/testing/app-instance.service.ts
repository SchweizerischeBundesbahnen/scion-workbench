import { Injectable } from '@angular/core';
import { UUID } from '@scion/workbench-application.core';

@Injectable({providedIn: 'root'})
export class AppInstance {

  public readonly uuid = UUID.randomUUID();
}
