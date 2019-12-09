import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Beans, Capability, mapToBody, MessageClient } from '@scion/microfrontend-platform';
import { SciParamsEnterComponent } from '@scion/app/common';
import { Observable } from 'rxjs';
import { CapabilityRegisterCommand, CapabilityUnregisterCommand, Topics } from '../../microfrontend-api';

const TYPE = 'type';
const QUALIFIER = 'qualifier';
const PRIVATE = 'private';

@Component({
  selector: 'app-manage-capabilities',
  templateUrl: './manage-capabilities.component.html',
  styleUrls: ['./manage-capabilities.component.scss'],
})
export class ManageCapabilitiesComponent {

  public readonly TYPE = TYPE;
  public readonly QUALIFIER = QUALIFIER;
  public readonly PRIVATE = PRIVATE;

  public form: FormGroup;
  public capabilities$: Observable<Capability[]>;

  constructor(fb: FormBuilder) {
    this.form = fb.group({
      [TYPE]: new FormControl('', Validators.required),
      [QUALIFIER]: fb.array([]),
      [PRIVATE]: new FormControl(true, Validators.required),
    });

    this.capabilities$ = Beans.get(MessageClient).request$<Capability[]>(Topics.Capabilities).pipe(mapToBody());
  }

  public onCapabilityRegister(): void {
    const registerCommand: CapabilityRegisterCommand = {
      capability: {
        type: this.form.get(TYPE).value,
        qualifier: SciParamsEnterComponent.toParams(this.form.get(QUALIFIER) as FormArray),
        private: this.form.get(PRIVATE).value,
      },
    };
    Beans.get(MessageClient).publish$(Topics.RegisterCapability, registerCommand).subscribe();
  }

  public onCapabilityUnregister(capability: Capability): void {
    const unregisterCommand: CapabilityUnregisterCommand = {capabilityId: capability.metadata.id};
    Beans.get(MessageClient).publish$(Topics.UnregisterCapability, unregisterCommand).subscribe();
  }
}
