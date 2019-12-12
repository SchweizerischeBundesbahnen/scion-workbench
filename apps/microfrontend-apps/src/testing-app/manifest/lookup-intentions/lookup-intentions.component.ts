import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Beans, Intention, IntentionFilter, ManifestService } from '@scion/microfrontend-platform';
import { SciParamsEnterComponent } from '@scion/ɵtoolkit/widgets';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

const ID = 'id';
const TYPE = 'type';
const QUALIFIER = 'qualifier';
const NILQUALIFIER_IF_EMPTY = 'nilQualifierIfEmpty';
const APP_SYMBOLIC_NAME = 'appSymbolicName';

@Component({
  selector: 'app-lookup-intentions',
  templateUrl: './lookup-intentions.component.html',
  styleUrls: ['./lookup-intentions.component.scss'],
})
export class LookupIntentionsComponent {

  public readonly ID = ID;
  public readonly TYPE = TYPE;
  public readonly QUALIFIER = QUALIFIER;
  public readonly NILQUALIFIER_IF_EMPTY = NILQUALIFIER_IF_EMPTY;
  public readonly APP_SYMBOLIC_NAME = APP_SYMBOLIC_NAME;

  public form: FormGroup;
  public intentions$: Observable<Intention[]>;

  constructor(fb: FormBuilder) {
    this.form = fb.group({
      [ID]: new FormControl(''),
      [TYPE]: new FormControl(''),
      [QUALIFIER]: fb.array([]),
      [NILQUALIFIER_IF_EMPTY]: new FormControl(false),
      [APP_SYMBOLIC_NAME]: new FormControl(''),
    });
  }

  public onLookup(): void {
    const nilQualifierIfEmtpy = this.form.get(NILQUALIFIER_IF_EMPTY).value;
    const qualifier = SciParamsEnterComponent.toParamsDictionary(this.form.get(QUALIFIER) as FormArray, false);

    const filter: IntentionFilter = {
      id: this.form.get(ID).value || undefined,
      type: this.form.get(TYPE).value || undefined,
      qualifier: Object.keys(qualifier).length ? qualifier : (nilQualifierIfEmtpy ? {} : undefined),
      appSymbolicName: this.form.get(APP_SYMBOLIC_NAME).value || undefined,
    };
    this.intentions$ = Beans.get(ManifestService).lookupIntentions$(filter)
      .pipe(finalize(() => this.intentions$ = null));
  }

  public onLookupCancel(): void {
    this.intentions$ = null;
  }

  public onReset(): void {
    this.form.reset();
    this.form.setControl(QUALIFIER, new FormArray([]));
  }
}
