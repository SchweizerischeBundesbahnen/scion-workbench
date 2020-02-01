import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Beans, CapabilityProvider, ManifestObjectFilter, ClientConfig, ManifestService } from '@scion/microfrontend-platform';
import { SciParamsEnterComponent } from '@scion/ɵtoolkit/widgets';
import { noop, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

const TYPE = 'type';
const QUALIFIER = 'qualifier';
const PRIVATE = 'private';
const ID = 'id';
const NILQUALIFIER_IF_EMPTY = 'nilQualifierIfEmpty';
const APP_SYMBOLIC_NAME = 'appSymbolicName';

@Component({
  selector: 'app-register-capability-providers',
  templateUrl: './register-capability-providers.component.html',
  styleUrls: ['./register-capability-providers.component.scss'],
})
export class RegisterCapabilityProvidersComponent {

  public readonly TYPE = TYPE;
  public readonly QUALIFIER = QUALIFIER;
  public readonly PRIVATE = PRIVATE;
  public readonly ID = ID;
  public readonly NILQUALIFIER_IF_EMPTY = NILQUALIFIER_IF_EMPTY;
  public readonly APP_SYMBOLIC_NAME = APP_SYMBOLIC_NAME;

  public registerForm: FormGroup;
  public unregisterForm: FormGroup;

  public providers$: Observable<CapabilityProvider[]>;

  public registerResponse: string;
  public registerError: string;
  public unregisterResponse: 'OK' | undefined;
  public unregisterError: string;

  constructor(fb: FormBuilder) {
    this.registerForm = fb.group({
      [TYPE]: new FormControl('', Validators.required),
      [QUALIFIER]: fb.array([]),
      [PRIVATE]: new FormControl(false),
    });

    this.unregisterForm = fb.group({
      [ID]: new FormControl(''),
      [TYPE]: new FormControl(''),
      [QUALIFIER]: fb.array([]),
      [NILQUALIFIER_IF_EMPTY]: new FormControl(false),
      [APP_SYMBOLIC_NAME]: new FormControl(''),
    });

    this.providers$ = Beans.get(ManifestService).lookupCapabilityProviders$({appSymbolicName: Beans.get(ClientConfig).symbolicName});
  }

  public onRegister(): void {
    this.registerResponse = undefined;
    this.registerError = undefined;

    const provider: CapabilityProvider = {
      type: this.registerForm.get(TYPE).value,
      qualifier: SciParamsEnterComponent.toParamsDictionary(this.registerForm.get(QUALIFIER) as FormArray),
      private: this.registerForm.get(PRIVATE).value,
    };

    Beans.get(ManifestService).registerCapabilityProvider$(provider)
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

    Beans.get(ManifestService).unregisterCapabilityProviders$(filter)
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
