## Angular Animations + Focus Tracking

If we remove Angular animations, the focus tracker test (projects/scion/e2e-testing/src/workbench/focus-tracker.e2e-spec.ts /"should preserve view focus on re-layout") fails.
This is due to Angular animations batching DOM updates, which is a different behavior with no Angular animations.

The `onDestroy` hook on the embedded view in `projects/scion/workbench/src/lib/portal/workbench-portal-outlet.directive.ts`, gets called to late now.
When it's called, the element is already gone from the DOM and the scroll position and focus cannot be stored in the `projects/scion/workbench/src/lib/view/view-slot.component.ts`.
