import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'wb-searchfield',
  templateUrl: './searchfield.component.html',
  styleUrls: ['./searchfield.component.scss']
})
export class SearchfieldComponent implements AfterViewInit, OnDestroy {

  private _destroy$ = new Subject<void>();

  public inputControl = new FormControl();

  private _focused = true;

  @ViewChild('input')
  private inputElement: ElementRef;

  @Input()
  public placeholder: string;

  @Output()
  public search = new EventEmitter<RegExp>(false);

  @HostBinding('class.focus')
  public get hasFocus(): boolean {
    return this._focused;
  }

  @HostBinding('class.empty')
  public get empty(): boolean {
    return !this.inputControl.value;
  }

  constructor() {
    this.inputControl.valueChanges
      .pipe(
        takeUntil(this._destroy$),
        debounceTime(10),
        distinctUntilChanged()
      )
      .subscribe((filterText: string) => {
        this.search.emit(SearchfieldComponent.toFilterRegExp(filterText));
      });
  }

  public onClear(): void {
    this.inputControl.setValue(null);
    this.requestFocus();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  public ngAfterViewInit(): void {
    this.requestFocus();
  }

  public onRequestFocus(): void {
    this.requestFocus();
  }

  public onFocusIn(): void {
    this._focused = true;
  }

  public onFocusOut(): void {
    this._focused = false;
  }

  private requestFocus(): void {
    this.inputElement.nativeElement.focus();
  }

  /**
   * Creates a regular expression of the given filter text, and transforms asterisk (*) wildcard characters to match
   * any text (.*).
   */
  private static toFilterRegExp(filterText: string): RegExp {
    if (!filterText) {
      return null;
    }

    // Escape the user filter input and add wildcard support
    const escapedString = filterText.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    const wildcardString = escapedString.replace(/\\\*/g, '.*');
    return new RegExp(wildcardString, 'i');
  }
}
