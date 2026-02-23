import {ChangeDetectionStrategy, Component, effect, ElementRef, inject, Injector, input, untracked, ViewContainerRef} from '@angular/core';
import {SciToolGroupComponent} from './toolbar-group.component';
import {installMenuAccelerators} from '../menu-accelerators';
import {ɵSciMenuService} from '../ɵmenu.service';
import {MaybeArray} from '@scion/sci-components/common';
import {SciMenuEnvironmentProviders} from '../environment/menu-environment-providers';

/**
 * TODO [menu]: Explain how to size the toolbar. (height can be set; icon size by setting a CSS variable)
 */
@Component({
  selector: 'sci-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SciToolGroupComponent,
  ],
  host: {
    '[class.empty]': '!menuItems().length', // Public API
  },
})
export class SciToolbarComponent {

  public readonly name = input.required<`toolbar:${string}`>();
  public readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  public readonly context = input<Map<string, unknown>>();
  public readonly acceleratorTarget = input<MaybeArray<Element | ElementRef<Element>> | undefined>();
  public readonly popoverViewContainerRef = input<ViewContainerRef | undefined>();

  private readonly _menuService = inject(ɵSciMenuService);
  private readonly _context = inject(SciMenuEnvironmentProviders).provideContext(this.context);

  protected readonly menuItems = this._menuService.menuItems(this.name, this._context);

  constructor() {
    this.installAccelerators();
  }

  private installAccelerators(): void {
    const injector = inject(Injector);

    // TODO [menu] Do we have to use a root effect? Was the case in previous implementation
    // // Use root effect to run even if the parent component is detached from change detection (e.g., if the view is not visible).
    // rootEffect(onCleanup => {

    effect(onCleanup => {
      const name = this.name();
      const target = this.acceleratorTarget();
      const context = this._context();

      untracked(() => {
        const ref = installMenuAccelerators(name, {target, context, injector});
        onCleanup(() => ref.dispose());
      });
    });
  }
}
