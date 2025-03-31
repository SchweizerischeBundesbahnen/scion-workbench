The icon font 'scion-workbench-icons' is managed with IcoMoon application
-------------------------------------------------------------------------

The following steps explain how to manage the icon font.

1. Open IcoMoon 'https://icomoon.io/app/#/projects' web application.
2. Click 'Import Project' from the file 'scion-workbench-icons.json' and click 'Load'
3. Open 'Selection' tab and select the items to include in the icon font (Material icons)
4. Open 'Generate Font' tab and set the ligatures
   DO NOT USE HYPHENS IN LIGATURES!
5. When done, download the font and unzip it.
6. Copy the font files contained in 'fonts' to '/resources/scion-workbench-icons/fonts':
  - scion-workbench-icons.svg
  - scion-workbench-icons.ttf
  - scion-workbench-icons.woff
7. Zip the font files to '/resources/scion-workbench-icons/fonts/fonts.zip' (referenced in the Workbench Getting Started Guide).
8. Go to 'Manage projects' and download the font definition file 'scion-workbench-icons.json' into the folder '/resources/scion-workbench-icons'
9. Increment the version in the variable '$version' in 'projects/scion/workbench/theme/_icons.scss' to support cache busting
