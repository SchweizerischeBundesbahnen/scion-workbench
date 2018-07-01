import { VIEW_REF_PREFIX } from '../workbench.constants';
import { IterableChanges, IterableDiffer, IterableDiffers } from '@angular/core';
import { DefaultUrlSerializer } from '@angular/router';

/**
 * Differ for view router outlets.
 *
 * @see IterableDiffer
 */
export class ViewOutletDiffer {

  private _differ: IterableDiffer<string>;

  constructor(differs: IterableDiffers) {
    this._differ = differs.find([]).create<string>();
  }

  public diff(url: string): IterableChanges<string> {
    const urlTree = new DefaultUrlSerializer().parse(url);
    const outlets = Object.keys(urlTree.root.children);

    const viewOutlets = outlets.filter(outlet => outlet.startsWith(VIEW_REF_PREFIX));
    return this._differ.diff(viewOutlets);
  }
}
