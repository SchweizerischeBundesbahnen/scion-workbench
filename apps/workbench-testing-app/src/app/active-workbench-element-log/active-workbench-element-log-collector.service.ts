import {effect, inject, Injectable, linkedSignal} from '@angular/core';
import {DialogId, PartId, PopupId, ViewId, WorkbenchService} from '@scion/workbench';

@Injectable({providedIn: 'root'})
export class ActiveWorkbenchElementLogCollectorService {

  private readonly _log = linkedSignal<PartId | ViewId | DialogId | PopupId | null, string[]>({
    source: inject(WorkbenchService).activeWorkbenchElement,
    computation: (activeWorkbenchElement, previous) => (previous?.value ?? []).concat(activeWorkbenchElement ?? '<null>'),
  });

  public readonly log = this._log.asReadonly();

  constructor() {
    effect(() => this.log()); // consume logs to collect all logs
  }

  public clear(): void {
    this._log.set([]);
  }
}
