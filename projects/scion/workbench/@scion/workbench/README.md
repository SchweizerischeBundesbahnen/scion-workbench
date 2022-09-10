## TL;DR
Allows the SASS module of "@scion/workbench" to be imported by the "workbench-testing-app" via `@use '@scion/workbench'`.

## Explanation
The SASS CSS loader allows to reference Sass modules of packages installed in the "node_modules" folder. For example, if having installed '@angular/cdk', its Sass modules can be imported as follows: @use '@angular/cdk'. But, when building or starting the testing app, the module `@scion/workbench` is not installed in the "node_modules". Since we didn't find a way to instruct the Sass CSS loader to load certain Sass modules from the "dist" or project folder instead of "node_modules", we have created the folder "@scion/workbench" and registered it as style preprocessor options in the application's `angular.json`. Note that both folders and contained files are excluded from the library build and not published to NPM. See included assets in `@scion/workbench/ng-package.json`.

## ng-package.json of "@scion/workbench"
{
  "assets": [
    "./{!(@scion)/**/,./}_*.scss" // include all SASS files starting with a leading underscore, but only if they are not contained in the directory /@scion/
  ]
}

## angular.json of "workbench-testing-app"
{
  "stylePreprocessorOptions": {
    "includePaths": [
      "projects/scion/workbench"
    ]
  }
}

## Usage in "workbench-testing-app"
@use '@scion/workbench';
