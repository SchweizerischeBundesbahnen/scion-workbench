/*
 * Copyright (c) 2018-2023 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {Component, EnvironmentProviders, inject, InjectionToken, makeEnvironmentProviders} from '@angular/core';
import {ComponentFixture} from '@angular/core/testing';
import {WorkbenchView} from '../view/workbench-view.model';
import {ViewId} from '../workbench.identifiers';

/**
 * Component that can be used in unit tests.
 */
@Component({
  selector: 'spec-test-component',
  template: `
    @if (content) {
      <main>{{content}}</main>
    }
    @if (renderComponentStateInputElement) {
      <input class="component-state"/>
    }
  `,
})
export default class _TestComponent {

  protected content = inject(COMPONENT_CONTENT, {optional: true});
  protected renderComponentStateInputElement = inject(COMPONENT_STATE_INPUT_ELEMENT, {optional: true});

  constructor() {
    const view = inject(WorkbenchView, {optional: true});
    if (view) {
      view.title = view.id;
    }
  }
}

/**
 * Component that can be used in unit tests.
 */
export const TestComponent = _TestComponent;

/**
 * DI token to define the content for display in the component.
 */
const COMPONENT_CONTENT = new InjectionToken<string>('COMPONENT_CONTENT');

/**
 * DI token to instruct the component to render an input field to test the state of a component.
 */
const COMPONENT_STATE_INPUT_ELEMENT = new InjectionToken<boolean>('COMPONENT_STATE_INPUT_ELEMENT');

/**
 * Configures the component to display the specified content.
 */
export function withComponentContent(content: string): EnvironmentProviders {
  return makeEnvironmentProviders([{provide: COMPONENT_CONTENT, useValue: content}]);
}

/**
 * Configures the component to add an input element in order to test the state of a component.
 */
export function withComponentStateInputElement(): EnvironmentProviders {
  return makeEnvironmentProviders([{provide: COMPONENT_STATE_INPUT_ELEMENT, useValue: true}]);
}

/**
 * Enters the specified text in the "Component State" input field of the specified view.
 *
 * Use that state to check whether the component has been re-created.
 */
export function enterComponentState(fixture: ComponentFixture<unknown>, viewId: ViewId, textualState: string): void {
  (fixture.nativeElement as HTMLElement).querySelector<HTMLOptionElement>(`wb-view-slot[data-viewid="${viewId}"] input.component-state`)!.value = textualState;
}
