import {Component, computed, contentChild, contentChildren, ElementRef, inject, Injector, input, model, OnInit, runInInjectionContext, Signal, signal, TemplateRef, TrackByFunction, untracked, viewChild} from '@angular/core';
import {SciScrollableDirective, SciScrollbarComponent} from '@scion/components/viewport';
import {CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport} from '@angular/cdk/scrolling';
import {ControlValueAccessor, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {toSignal} from '@angular/core/rxjs-interop';
import {InjectElementRefDirective} from './inject-element-ref.directive';
import {NgComponentOutlet, NgTemplateOutlet} from '@angular/common';
import {ProposalFieldButtonDirective, ProposalFieldContentDirective} from './proposal-field.model';
import {CdkTrapFocus} from '@angular/cdk/a11y';
import {ProposalComponent} from './proposal/proposal.component';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';
import {noop} from 'rxjs';

/**
 * Represents a proposal field that can be displayed in a popup.
 *
 * Usage:
 * ```html
 * TODO
 * ```
 */
@Component({
  selector: 'app-proposal-popup-field',
  templateUrl: './proposal-popup-field.component.html',
  styleUrls: ['./proposal-popup-field.component.scss'],
  standalone: true,
  imports: [
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    CdkFixedSizeVirtualScroll,
    SciScrollbarComponent,
    SciScrollableDirective,
    ReactiveFormsModule,
    InjectElementRefDirective,
    ProposalComponent,
    NgComponentOutlet,
    SciMaterialIconDirective,
    NgTemplateOutlet,
  ],
  hostDirectives: [
    CdkTrapFocus,
  ],
})
export class ProposalPopupFieldComponent<T = unknown> implements OnInit, ControlValueAccessor {

  /**
   * Specifies a function to provide proposals based on selection and filter.
   *
   * The function can call `inject` to get any required dependencies.
   */
  public proposalProviderFn = input.required<ProposalProviderFn<T>>();

  /**
   * Specifies a function to determine a proposal's identity.
   */
  public proposalKeyFn = input.required<ProposalKeyFn<T>>();

  /**
   * Optional placeholder to display in the filter field.
   */
  public filterPlaceholder = input<string>();

  /**
   * Optional label to display between selected and available proposals. Defaults to 'Suggestions'.
   */
  public separatorLabel = input<string>('Suggestions');

  /**
   * Specifies the height of a single proposal.
   */
  public proposalItemHeight = input(35);

  /**
   * Represents selected proposals.
   */
  public selection = model<string[]>([]);

  /** Template of a proposal */
  protected proposalContent = contentChild<ProposalFieldContentDirective>(ProposalFieldContentDirective);
  /** Buttons to display between filter field and proposals */
  protected proposalButtons = contentChildren<ProposalFieldButtonDirective>(ProposalFieldButtonDirective);

  protected listItems = signal<ListItem[]>([]).asReadonly();
  protected filterControl = inject(NonNullableFormBuilder).control('');
  protected filterElement = viewChild.required<ElementRef<HTMLElement>>('filter_element');
  protected cdkViewport = viewChild.required<CdkVirtualScrollViewport>(CdkVirtualScrollViewport);
  protected height: Signal<number>;

  private _activeProposalIndex = signal<number>(-1);
  private _filterText: Signal<string>;
  private _injector = inject(Injector);
  private _cvaChangeFn: (value: string[]) => void = noop;
  private _cvaTouchedFn: () => void = noop;

  constructor() {
    inject(CdkTrapFocus).autoCapture = true; // Auto focus
    this.height = computed(() => this.listItems().length * this.proposalItemHeight());
    this._filterText = toSignal(this.filterControl.valueChanges, {initialValue: this.filterControl.value});
  }

  public ngOnInit(): void {
    const initialSelection = new Set<string>(this.selection());
    this.listItems = this.computeListItems(initialSelection);
  }

  protected onListItemFocusIn(index: number): void {
    this._activeProposalIndex.set(index);
  }

  /**
   * Moves focus to the proposal list when `ArrowDown` is pressed.
   */
  protected onFilterArrowDown(): boolean {
    const nextFocusable = findNextFocusableListItem(-1, this.listItems());
    if (nextFocusable !== undefined) {
      this.focusListItem(nextFocusable).then();
    }
    return false; // prevent default
  }

  /**
   * Moves focus to the filter field when start typing.
   */
  protected onKeyDown(event: KeyboardEvent): void {
    if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey || noFocusMoveKeys.has(event.key)) {
      return;
    }
    this.filterElement().nativeElement.focus();
  }

  /**
   * Toggles selection for the given proposal.
   */
  protected onSelectProposal(proposalListItem: ProposalListItem<T>): false {
    const key = proposalListItem.key;
    const selection = new Set(this.selection());
    selection.has(key) ? selection.delete(key) : selection.add(key);
    this.selection.set([...selection]);
    this._cvaChangeFn(this.selection());
    this._cvaTouchedFn();
    return false; // prevent default
  }

  /**
   * Moves focus to the next proposal.
   */
  protected onArrowDown(): false {
    const index = this._activeProposalIndex();
    const nextFocusable = findNextFocusableListItem(index, this.listItems()) ?? findNextFocusableListItem(-1, this.listItems());
    if (nextFocusable !== undefined) {
      this.focusListItem(nextFocusable).then();
    }
    return false; // prevent default
  }

  /**
   * Moves focus to the previous proposal.
   */
  protected onArrowUp(): false {
    const index = this._activeProposalIndex();
    const previousFocusable = findPreviousFocusableListItem(index, this.listItems()) ?? findPreviousFocusableListItem(this.listItems().length, this.listItems());
    if (previousFocusable !== undefined) {
      this.focusListItem(previousFocusable).then();
    }
    return false; // prevent default
  }

  protected trackByFn: TrackByFunction<ListItem> = (index: number, listItem: ListItem): unknown => {
    return listItem instanceof ProposalListItem ? listItem.key : listItem;
  };

  /**
   * Computes list items based on the current selection and filter.
   *
   * 1. Retrieves proposals using the provider function.
   * 2. Maps proposals to {@link ProposalListItem}, sorting selected proposals first.
   * 3. Adds custom buttons at the beginning of the list.
   * 4. Inserts a separator between selected and non-selected proposals.
   */
  private computeListItems(initialSelection: Set<string>): Signal<ListItem[]> {
    // Invoke provider function when updated.
    const proposals = computed(() => {
      const provideProposalsFn = this.proposalProviderFn();
      return untracked(() => runInInjectionContext(this._injector, () => provideProposalsFn(this._filterText, this.selection.asReadonly())));
    });

    // Create list items based on the current selection and filter.
    return computed(() => {
      const keyFn = this.proposalKeyFn();
      const listItems: ListItem[] = proposals()()
        .map(proposal => new ProposalListItem(keyFn(proposal), proposal))
        .sort((a, b) => {
          if (initialSelection.has(a.key) && !initialSelection.has(b.key)) {
            return -1;
          }
          if (!initialSelection.has(a.key) && initialSelection.has(b.key)) {
            return 1;
          }
          return 0;
        });

      // Add custom buttons.
      this.proposalButtons().forEach(({template}) => {
        listItems.unshift(new ButtonListItem(template));
      });

      // Add separator between selected and non-selected proposals
      const firstNonSelected = listItems.findIndex(predicate => predicate instanceof ProposalListItem && !initialSelection.has(predicate.key));
      if (firstNonSelected >= 0) {
        listItems.splice(firstNonSelected, 0, new SeparatorListItem(this.separatorLabel));
      }

      return listItems;
    });
  }

  /**
   * Focuses specified proposal, moving it into viewport if not rendered.
   */
  private async focusListItem(index: number): Promise<void> {
    // Focus proposal if already rendered (virtual scrolling).
    if (this.isListItemRendered(index)) {
      this.listItems().at(index)!.element?.focus();
      return;
    }

    // Scroll proposal into viewport.
    this.cdkViewport().scrollToIndex(index);

    // Focus element when rendered.
    if (await this.waitUntilListItemRendered(index)) {
      this.listItems().at(index)?.element?.focus();
    }
  }

  /**
   * Checks if a list item is rendered.
   */
  private isListItemRendered(index: number): boolean {
    const {start, end} = this.cdkViewport().getRenderedRange();
    return index >= start && index <= end;
  }

  private async waitUntilListItemRendered(index: number): Promise<boolean> {
    for (let i = 0; !this.isListItemRendered(index) && i < 10; i++) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
    return this.isListItemRendered(index);
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public writeValue(selection: string[] | undefined | null): void {
    this.selection.set(selection ?? []);
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnChange(fn: any): void {
    this._cvaChangeFn = fn;
  }

  /**
   * Method implemented as part of `ControlValueAccessor` to work with Angular forms API
   * @docs-private
   */
  public registerOnTouched(fn: any): void {
    this._cvaTouchedFn = fn;
  }
}

/**
 * Finds the next focusable list item.
 */
function findNextFocusableListItem(startIndex: number, elements: ListItem[]): number | undefined {
  for (let i = startIndex + 1; i < elements.length; i++) {
    const element = elements[i];
    if (element.focusable) {
      return i;
    }
  }
  return undefined;
}

/**
 * Finds the previous focusable list item.
 */
function findPreviousFocusableListItem(startIndex: number, elements: ListItem[]): number | undefined {
  for (let i = startIndex - 1; i >= 0; i--) {
    const element = elements[i];
    if (element.focusable) {
      return i;
    }
  }
  return undefined;
}

/**
 * Function to provide proposals based on selection and filter.
 *
 * The function can call `inject` to get any required dependencies.
 */
export type ProposalProviderFn<T> = (filter: Signal<string>, selection: Signal<string[]>) => Signal<T[]>;

/**
 * Function to provide the identity of a proposal.
 */
export type ProposalKeyFn<T> = (proposal: T) => string;

/**
 * Specifies keys that prevent focus from moving to the filter field when pressed.
 */
const noFocusMoveKeys = new Set() // TODO [kge] find better name
  .add('Enter')
  .add(' ') // Space
  .add('Tab')
  .add('PageUp')
  .add('PageDown')
  .add('ArrowUp')
  .add('ArrowDown');

/**
 * Represents a list item.
 *
 * One of {@link ProposalListItem}, {@link ButtonListItem}, {@link SeparatorListItem}.
 */
export interface ListItem {
  readonly type: 'proposal' | 'separator' | 'button';
  readonly focusable: boolean;
  element?: HTMLElement | undefined;
}

/**
 * Represents a proposal list item.
 */
export class ProposalListItem<T> implements ListItem {

  public readonly type = 'proposal';
  public readonly focusable = true;
  public element?: HTMLElement | undefined;

  constructor(public readonly key: string, public readonly item: T) {
  }
}

/**
 * Represents a button list item.
 */
export class ButtonListItem implements ListItem {
  public readonly type = 'button';
  public readonly focusable = true;
  public element?: HTMLElement | undefined;

  constructor(public readonly template: TemplateRef<void>) {
  }
}

/**
 * Separates selected and available proposals.
 */
export class SeparatorListItem implements ListItem {

  public readonly type = 'separator';
  public readonly focusable = false;

  constructor(public readonly label: Signal<string>) {
  }
}
