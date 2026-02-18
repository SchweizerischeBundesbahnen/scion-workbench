## TL;DR
Enable applications in this repository to import the SCSS module `@scion/components` using the `@use '@scion/components'` syntax.

## Explanation
The SCSS loader supports referencing SCSS modules from packages installed in the `node_modules` folder, but not from a project folder.
For this reason, we have added the @scion folder to the project but excluded it from the library build so that it is not published to NPM.
See excluded assets in `@scion/components/ng-package.json`. We have also instructed `angular.json` to include this project when resolving
root imports.

## ng-package.json of "@scion/components"
{
  "assets": [
    "{,!(@scion)/**/}_*.scss" // include all SASS files starting with a leading underscore, but only if they are not contained in the directory /@scion/ or its subdirectories
  ]
}

## angular.json of applications in this repo
{
  "stylePreprocessorOptions": {
    "includePaths": [
      "projects/scion/components"
    ]
  }
}

## Usage in applications in this repo
@use '@scion/components';
