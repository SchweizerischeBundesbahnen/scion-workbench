import {Component, inject, input, signal} from '@angular/core';
import {Menu, MenuBar, MenuContent, MenuItem} from '@angular/aria/menu';
import {OverlayModule} from '@angular/cdk/overlay';
import {SciMenuRegistry} from '../menu.registry';
import {HolderDirective} from './holder.directive';
import {SetIntoHolderDirective} from './set-into-holder.directive';
import {MMenuGroup, MMenuItem, MSubMenuItem} from '../ɵmenu';

@Component({
  selector: 'sci-toolbar-cdk',
  imports: [MenuBar, Menu, MenuContent, MenuItem, OverlayModule, HolderDirective, SetIntoHolderDirective],
  templateUrl: './toolbar-cdk.component.html',
  styleUrl: './toolbar-cdk.component.scss',
})
export class SciToolbarComponent {

  public readonly name = input.required<string>();

  protected readonly menuRegistry = inject(SciMenuRegistry);

  // fileMenu = viewChild<Menu<string>>('fileMenu');
  // shareMenu = viewChild<Menu<string>>('shareMenu');
  // editMenu = viewChild<Menu<string>>('editMenu');
  // viewMenu = viewChild<Menu<string>>('viewMenu');
  // insertMenu = viewChild<Menu<string>>('insertMenu');
  // imageMenu = viewChild<Menu<string>>('imageMenu');
  // chartMenu = viewChild<Menu<string>>('chartMenu');
  // formatMenu = viewChild<Menu<string>>('formatMenu');
  // textMenu = viewChild<Menu<string>>('textMenu');
  // sizeMenu = viewChild<Menu<string>>('sizeMenu');
  // paragraphMenu = viewChild<Menu<string>>('paragraphMenu');
  // alignMenu = viewChild<Menu<string>>('alignMenu');
  rendered = signal(false);

  onFocusIn() {
    this.rendered.set(true);
  }

  public getMenuItems(menu: MSubMenuItem): Array<MMenuItem | MSubMenuItem | MMenuGroup> {
    return [
      ...menu.children,
      ...this.menuRegistry.findMenuContributions(menu.id).flatMap(m => m.menuItems),
    ];
  }
}
