import {Directive, effect, inject, input} from '@angular/core';
import {Menu} from '@angular/aria/menu';
import {HolderDirective} from './holder.directive';

@Directive({
  selector: '[wbSetIntoHolder]',
  exportAs: 'wbSetIntoHolder',
})
export class SetIntoHolderDirective {

  public readonly holder = input.required<HolderDirective>();

  constructor() {
    const menu = inject(Menu);
    effect(() => {
      this.holder().menu.set(menu);
    })
  }

}
