# [16.0.0-beta.6](https://github.com/SchweizerischeBundesbahnen/scion-workbench/compare/16.0.0-beta.5...16.0.0-beta.6) (2023-09-20)


### Bug Fixes

* **workbench:** do not publish changed layout objects until processed a layout change ([8286d65](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/8286d657487cfc23717cf02a502ea141e36357af))


### Features

* **workbench:** allow for a layout with an optional main area ([ff6697a](https://github.com/SchweizerischeBundesbahnen/scion-workbench/commit/ff6697a641b6719faedea966a5f1bc3e1099805f)), closes [#443](https://github.com/SchweizerischeBundesbahnen/scion-workbench/issues/443)


### BREAKING CHANGES

* **workbench:** Adding support for optional main area introduced breaking changes.

  The following APIs have changed:
    - renamed `MAIN_AREA_PART_ID` to `MAIN_AREA`;
    - changed signature of `WorkbenchLayoutFn` to take `WorkbenchLayoutFactory` instead of `WorkbenchLayout` as argument;
    - layout definitions, if any, must now add the `MAIN_AREA` part explicitly;
    - changed inputs of `wbPartAction` directive to take `canMatch` function instead of `view`, `part` and `area` inputs;

  ### The following snippets illustrate how a migration could look like:

  #### Initial layout: Before migration

  ```ts
  import {MAIN_AREA_PART_ID, WorkbenchModule} from '@scion/workbench';
  
  WorkbenchModule.forRoot({
    layout: layout => layout
      .addPart('left', {relativeTo: MAIN_AREA_PART_ID, align: 'left', ratio: .25})
      .addView('navigator', {partId: 'left', activateView: true})
  });
  ```

  #### Initial layout: After migration

  ```ts
  import {MAIN_AREA, WorkbenchLayoutFactory, WorkbenchModule} from '@scion/workbench';
  
  WorkbenchModule.forRoot({
    layout: (factory: WorkbenchLayoutFactory) => factory
      .addPart(MAIN_AREA)
      .addPart('left', {relativeTo: MAIN_AREA, align: 'left', ratio: .25})
      .addView('navigator', {partId: 'left', activateView: true})
  });
  ```

  #### Part Action: Before migration

  ```html
  <wb-workbench>
    <ng-template wbPartAction area="main">
      <button [wbRouterLink]="'/path/to/view'">
        Open View
      </button>
    </ng-template>
  </wb-workbench>
  ```

  #### Part Action: After migration

  ```html
  <wb-workbench>
    <ng-template wbPartAction [canMatch]="isPartInMainArea">
      <button [wbRouterLink]="'/path/to/view'">
        Open View
      </button>
    </ng-template>
  </wb-workbench>
  ```

  ```ts
  isPartInMainArea = (part: WorkbenchPart): boolean => {
    return part.isInMainArea;
  };
  ```
