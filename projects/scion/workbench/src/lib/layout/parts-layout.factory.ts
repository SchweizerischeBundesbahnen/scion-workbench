import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { WorkbenchViewRegistry } from '../view/workbench-view.registry';
import { UUID } from '@scion/toolkit/uuid';
import { PartsLayout, PartsLayoutWorkbenchAccessor } from './parts-layout';
import { MPartsLayout } from './parts-layout.model';

/**
 * Factory for creating a parts layout instance.
 */
@Injectable()
export class PartsLayoutFactory {

  private readonly _workbenchAccessor: PartsLayoutWorkbenchAccessor;

  constructor(viewRegistry: WorkbenchViewRegistry, @Optional() @Inject(PARTS_LAYOUT_ROOT_PART_IDENTITY) rootPartIdentity?: string) {
    this._workbenchAccessor = {
      getViewActivationInstant: (viewId: string): number => {
        return viewRegistry.getElseThrow(viewId).activationInstant;
      },
      provideRootPartIdentity: (): string => {
        return rootPartIdentity || UUID.randomUUID();
      },
    };
  }

  /**
   * Creates an immutable {@link PartsLayout} instance that represents the given layout.
   * If not providing a layout, the returned layout consists of a single root part.
   */
  public create(layout?: string | MPartsLayout): PartsLayout {
    return new PartsLayout(this._workbenchAccessor, layout);
  }
}

/**
 * Control the identity for the root part, e.g., useful in specs.
 */
export const PARTS_LAYOUT_ROOT_PART_IDENTITY = new InjectionToken<string>('PARTS_LAYOUT_ROOT_PART_IDENTITY');
