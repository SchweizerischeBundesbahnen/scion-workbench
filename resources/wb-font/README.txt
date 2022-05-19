1. Go to the IcoMoon app 'http://icomoon.io/app' to manage the webfont, e.g. adding or removing icons
2. Import './icomoon_generated/selection.json' into the IcoMoon app using the 'Import Icons' button
3. In IconMoon app, generate the font and download it
4. Copy font files to '/assets/fonts/'
    - wb.eot
    - wb.svg
    - wb.ttf
    - wb.woff
5. Copy CSS classes from './icomoon_generated/style.css' into 'projects/scion/workbench/src/theme/_font-theme.scss'
   >> Use '::' instead of ':' to specify '::before' pseudo-element (valid CSS)
6. Create 'fonts.zip' and put it into '/resources/wb-font'
