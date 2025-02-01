# API THINKTANK:

## GIVEN

layout.addPart(id: string, relativeTo: ReferencePart, options?: {activate?: boolean}): WorkbenchLayout;

Vorschlag Metadata ins Layout:
interface PartMetaData {
icon?: string;
label?: string;
tooltip?: string;
title?: string;
}

ADDITIONAL: addPart(id: string, placeIn: PlaceInRegion), metadata: PartMetaData): WorkbenchLayout;

== VARIANTE 1:
GIVEN:      addPart(id: string, relativeTo: ReferencePart, options?: {activate?: boolean}): WorkbenchLayout;
ADDITIONAL: addPart(id: string, placeIn: PlaceInRegion | PlaceInRegionBefore | PlaceInRegionAfter), metadata: PartMetaData): WorkbenchLayout;

interface PlaceInRegion {
region: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right';
align?: 'start' | 'end';
}
interface PlaceInRegionBefore {
region: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right';
before: string; // part id or alternative part id
}
interface PlaceInRegionAfter {
region: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right';
after: string; // part id or alternative part id
}

### Usage
layout
.addPart('bottom', {relativeTo: 'part.explorer', align: 'bottom'})

// Beispiel mit Metadaten  
.addPart('part.explorer', {region: 'left-top'}, {icon: 'xy', label: '%explorer', title: '%explorer'})

.addPart('part.explorer', {region: 'left-top'}) // default at the end
.addPart('part.explorer', {region: 'left-top', align: 'start'})

.addPart('part.navigator', {region: 'left-top', before: 'part.explorer'})
.addPart('part.navigator', {region: 'left-top', after: 'part.explorer'})

== VARIANTE 2 (analog existierens API):
GIVEN:      addPart(id: string, relativeTo: ReferencePart, options?: {activate?: boolean}): WorkbenchLayout;
ADDITIONAL: addPart(id: string, placeIn: PlaceInRegion | PlaceInRegionRelativeTo), metadata: PartMetaData): WorkbenchLayout;

interface PlaceInRegion {
region: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right';
align?: 'start' | 'end';
}
interface PlaceInRegionRelativeTo {
region: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right';
relativeTo: string;
align: 'before' | 'after';
}

interface ReferencePart {
relativeTo?: string;
align: 'left' | 'right' | 'top' | 'bottom';
ratio?: number;

### Usage
layout
.addPart('bottom', {relativeTo: 'part.explorer', align: 'bottom'})
.addPart('part.right', {relativeTo: MAIN_AREA, align: 'right'})


// Beispiel mit Metadaten
.addPart('part.explorer', {region: 'left-top'}, {icon: 'xy', label: '%explorer', title: '%explorer'})

.addPart('part.explorer', {region: 'left-top'}) // default at the end
.addPart('part.explorer', {region: 'left-top', align: 'start'})

.addPart('part.navigator', {region: 'left-top', relativeTo: 'part.explorer', align: 'before'})
.addPart('part.navigator', {region: 'left-top', relativeTo: 'part.explorer', align: 'after'})


# How to provide MetaData
### Variante 1 Icon/Text Provider
provideWorkbench({
textProvider: (key: string): string => }}
iconProvider: (icon: string): Component => }}
layout: factory => factory.addPart(MAIN_AREA)
});

### Variante 2 Icon/Text Provider (via providers)
providers: [
{provide: WORKBENCH_TEXT_PROVIDER, useValue: (key: string) => }}
{provide: WORKBENCH_ICON_PROVIDER, useValue: (icon: string) => }}
]

### Variante 3 Icon/Text Provider (via providers, new Angular way) (providerAppInitializer, provideEnvironmentProvider)
provideWorkbenchTextProvider(key => )
provideWorkbenchIconProvider(key => )

### Variante 4 Icon/Text Provider (via WorkbenchService)
inject(WorkbenchService).registerIconProvider((icon: string) => Component);
inject(WorkbenchService).registerTextProvider((text: string) => 'text');

### Variante 5 Metadata for specific part
inject(WorkbenchService).registerPartAction
inject(WorkbenchService).registerPartMetadata(partId,

/**
*  Associates metadata with a given part
   */
   inject(WorkbenchService).registerMetadata('part.navigator', () => ({
   icon: IconComponent,
   label: 'text',
   title: 'title',
   tooltip: 'tooltip',
   });
  
