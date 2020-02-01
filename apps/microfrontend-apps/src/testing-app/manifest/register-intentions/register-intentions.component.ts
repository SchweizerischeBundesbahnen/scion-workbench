import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Beans, ClientConfig, Intention, ManifestObjectFilter, ManifestService } from '@scion/microfrontend-platform';
import { SciParamsEnterComponent } from '@scion/ɵtoolkit/widgets';
import { noop, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

const TYPE = 'type';
const QUALIFIER = 'qualifier';
const ID = 'id';
const NILQUALIFIER_IF_EMPTY = 'nilQualifierIfEmpty';
const APP_SYMBOLIC_NAME = 'appSymbolicName';

@Component({
  selector: 'app-register-intentions',
  templateUrl: './register-intentions.component.html',
  styleUrls: ['./register-intentions.component.scss'],
})
export class RegisterIntentionsComponent {

  public readonly TYPE = TYPE;
  public readonly QUALIFIER = QUALIFIER;
  public readonly ID = ID;
  public readonly NILQUALIFIER_IF_EMPTY = NILQUALIFIER_IF_EMPTY;
  public readonly APP_SYMBOLIC_NAME = APP_SYMBOLIC_NAME;

  public registerForm: FormGroup;
  public unregisterForm: FormGroup;

  public intentions$: Observable<Intention[]>;

  public registerResponse: string;
  public registerError: string;
  public unregisterResponse: 'OK' | undefined;
  public unregisterError: string;

  constructor(fb: FormBuilder) {
    this.registerForm = fb.group({
      [TYPE]: new FormControl('', Validators.required),
      [QUALIFIER]: fb.array([]),
    });

    this.unregisterForm = fb.group({
      [ID]: new FormControl(''),
      [TYPE]: new FormControl(''),
      [QUALIFIER]: fb.array([]),
      [NILQUALIFIER_IF_EMPTY]: new FormControl(false),
      [APP_SYMBOLIC_NAME]: new FormControl(''),
    });

    this.intentions$ = Beans.get(ManifestService).lookupIntentions$({appSymbolicName: Beans.get(ClientConfig).symbolicName});
  }

  public onRegister(): void {
    this.registerResponse = undefined;
    this.registerError = undefined;

    const intention: Intention = {
      type: this.registerForm.get(TYPE).value,
      qualifier: SciParamsEnterComponent.toParamsDictionary(this.registerForm.get(QUALIFIER) as FormArray),
    };

    Beans.get(ManifestService).registerIntention$(intention)
      .pipe(finalize(() => {
        this.registerForm.reset();
        this.registerForm.setControl(QUALIFIER, new FormArray([]));
      }))
      .subscribe(
        id => this.registerResponse = id,
        error => this.registerError = error,
      );
  }

  public onUnregister(): void {
    this.unregisterResponse = undefined;
    this.unregisterError = undefined;

    const nilQualifierIfEmtpy = this.unregisterForm.get(NILQUALIFIER_IF_EMPTY).value;
    const qualifier = SciParamsEnterComponent.toParamsDictionary(this.unregisterForm.get(QUALIFIER) as FormArray, false);

    const filter: ManifestObjectFilter = {
      id: this.unregisterForm.get(ID).value || undefined,
      type: this.unregisterForm.get(TYPE).value || undefined,
      qualifier: Object.keys(qualifier).length ? qualifier : (nilQualifierIfEmtpy ? {} : undefined),
      appSymbolicName: this.unregisterForm.get(APP_SYMBOLIC_NAME).value || undefined,
    };

    Beans.get(ManifestService).unregisterIntentions$(filter)
      .pipe(finalize(() => {
        this.unregisterForm.reset();
        this.unregisterForm.setControl(QUALIFIER, new FormArray([]));
      }))
      .subscribe(
        noop,
        error => this.unregisterError = error,
        () => this.unregisterResponse = 'OK',
      );
  }
}
