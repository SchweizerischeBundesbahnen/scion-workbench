import {ChangeDetectionStrategy, Component, input, output, ViewContainerRef} from '@angular/core';
import {SciToolGroupComponent} from './tool-item-group/tool-item-group.component';

@Component({
  selector: 'sci-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SciToolGroupComponent,
  ],
})
export class SciToolbarComponent {

  public readonly name = input.required<string>();
  public readonly viewContainerRef = input<ViewContainerRef | undefined>();
  public readonly toolbarMenuOpen = output<boolean>();
  public readonly toolbarEmpty = output<boolean>();

  protected onToolbarEmptyChange(empty: boolean): void {
    this.toolbarEmpty.emit(empty);
  }

  protected onMenuOpen(open: boolean): void {
    this.toolbarMenuOpen.emit(open);
  }
}
