import {Directive, signal} from '@angular/core';
import {Menu} from '@angular/aria/menu';

@Directive({
  selector: '[wbHolder]',
  exportAs: 'wbHolder'
})
export class HolderDirective {

  public menu = signal<Menu<string> | undefined>(undefined);
}
