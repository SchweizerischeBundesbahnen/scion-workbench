import {ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, Injector, input, linkedSignal, output, signal, Signal, TemplateRef, untracked, viewChild, ViewContainerRef} from '@angular/core';
import {SciMenuRegistry} from '../menu.registry';
import {MMenuGroup, MMenuItem, MSubMenuItem} from '../ɵmenu';
import {MenuComponent} from '../menu/menu.component';
import {UUID} from '@scion/toolkit/uuid';
import {NgComponentOutlet} from '@angular/common';
import {MenuItemStateDirective} from '../menu/menu-item-state.directive';
import {SciDimension} from '@scion/components/dimension';

@Component({
  selector: 'sci-toolbar-group',
  templateUrl: './toolbar-group.component.html',
  styleUrl: './toolbar-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MenuComponent,
    NgComponentOutlet,
    MenuItemStateDirective,
  ],
})
export class SciToolGroupComponent {

  public readonly subMenuItem = input.required<string | MMenuGroup>();
  public readonly disabled = input<boolean>();
  public readonly viewContainerRef = input<ViewContainerRef | undefined>();
  public readonly groupEmpty = output<boolean>();
  public readonly groupMenuOpen = output<boolean>();

  private readonly _menuRegistry = inject(SciMenuRegistry);
  private readonly _popover = viewChild('popover', {read: ElementRef<HTMLElement>});
  private readonly _popoverTemplate = viewChild.required('popover_template', {read: TemplateRef<void>});

  protected readonly popoverId = UUID.randomUUID();
  protected readonly menuItems = this.computeMenuItems();
  protected readonly activeSubMenuItem = linkedSignal<string | MMenuGroup, {subMenuItem: MSubMenuItem, bounds: Signal<SciDimension>} | null>({
    source: this.subMenuItem,  // reset active sub menu item when this component is re-used
    computation: () => null,
  });

  constructor() {
    // Open popover when hovering over a submenu item, or hide it otherwise.
    effect(() => {
      const popover = this._popover();
      const activeSubMenuItem = this.activeSubMenuItem();

      untracked(() => {
        if (activeSubMenuItem) {
          popover?.nativeElement.showPopover();
        }
        else {
          popover?.nativeElement.hidePopover();
        }
      });
    });

    effect(() => {
      const open = this.activeSubMenuItem() !== null;
      untracked(() => this.groupMenuOpen.emit(open));
    });

    effect(() => {
      this.groupEmpty.emit(this.menuItems().every(menuItem => isEmtpy(menuItem)()));
    });

    // Attach popover to configured view ref. Defaults to this component's view ref.
    const injector = inject(Injector);
    effect(onCleanup => {
      const popoverTemplate = this._popoverTemplate();
      const viewContainerRef = this.viewContainerRef() ?? injector.get(ViewContainerRef);

      untracked(() => {
        const popoverViewRef = viewContainerRef.createEmbeddedView(popoverTemplate, undefined, {injector});
        popoverViewRef.detectChanges(); // required?
        onCleanup(() => () => popoverViewRef.destroy());
      });
    });
  }

  private computeMenuItems(): Signal<Array<MMenuItem | MSubMenuItem | MMenuGroup>> {
    return computed(() => {
      const subMenuItem = this.subMenuItem();
      if (typeof subMenuItem === 'string') {
        return this._menuRegistry.findMenuContributions(subMenuItem).flatMap(m => m.menuItems);
      }

      // TODO [MENU] Sort by order (e.g., after, before)
      return subMenuItem.children.concat(this._menuRegistry.findMenuContributions(subMenuItem.id).flatMap(m => m.menuItems))
    });
  }

  protected onSubMenuClick(subMenuItem: MSubMenuItem, bounds: Signal<SciDimension>): void {
    this.activeSubMenuItem.update(activeSubMenuItem => activeSubMenuItem?.subMenuItem === subMenuItem ? null : {subMenuItem, bounds});
  }

  protected onTogglePopover(event: ToggleEvent): void {
    if (event.newState === 'closed') {
      this.activeSubMenuItem.set(null);
    }
  }
}

export function isEmtpy(menuItem: MMenuItem | MSubMenuItem | MMenuGroup): Signal<boolean> {
  switch (menuItem.type) {
    case 'menu-item':
      return signal(false);
    case 'sub-menu-item':
    case 'group':
      return computed(() => menuItem.children.every(menuItem => isEmtpy(menuItem)())); // TODO [menu] consider contributions
  }
}
