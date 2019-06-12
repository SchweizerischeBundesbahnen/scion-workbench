/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// TODO [Angular 9]: Remove 'tslint:disable:typedef' as the import(...) restriction will be relaxed with the release of Ivy.
// As of Angular 8 ngc (Angular compiler) does not allow to have a typedef in the arrow-call-signature.
// Allowed syntax: https://github.com/angular/angular-cli/blob/a491b09800b493fe01301387fa9a025f7c7d4808/packages/ngtools/webpack/src/transformers/import_factory.ts#L104-L113
// tslint:disable:typedef
const routes: Routes = [
  {path: 'contact', loadChildren: () => import('./contact/contact.module').then(mod => mod.ContactModule)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
