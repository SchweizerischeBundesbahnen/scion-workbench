# API THINKTANK:

## GIVEN

layout.addPart(id: string, relativeTo: ReferencePart, options?: {activate?: boolean}): WorkbenchLayout;



ADDITIONAL: addPart(id: string, placeIn: PlaceInRegion, metadata: PartMetaData): WorkbenchLayout;

ADDITIONAL: addPart(id: string, region: Region): WorkbenchLayout;

interface RegionOptions {
  region: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right';
}


== VARIANTE 1:
GIVEN:      addPart(id: string, relativeTo: ReferencePart, options?: {activate?: boolean}): WorkbenchLayout;
ADDITIONAL: addPart(id: string, placeIn: PlaceInRegion | PlaceInRegionBefore | PlaceInRegionAfter), metadata: PartMetaData): WorkbenchLayout;



interface PlaceInRegion { // Varianten: PlaceInRegion, Region, RegionArea (Favorit kge), RegionPlacement, Placement, PlacementArea, PlacementRegion,
region: 'left-top' | 'left-bottom' | 'right-top' | 'right-bottom' | 'bottom-left' | 'bottom-right';
align?: 'start' | 'end'; // Vorerst weglassen
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
.addPart('part.explorer', {region: 'left-top'}, {icon: 'xy', label: {key: 'explorer'}, title: '%explorer'})

.addPart('part.explorer', {region: 'left-top'}, {icon: 'xy', label: {value: 'explorer'}, title: {value: 'explorer'}})

.addPart('part.explorer', {region: 'left-top'}, {icon: 'xy', label: 'explorer', title: 'explorer'})

.addPart('part.explorer', {region: 'left-top'}) // default at the end
.addPart('part.explorer', {region: 'left-top', align: 'start'})

.addPart('part.navigator', {region: 'left-top', relativeTo: 'part.explorer', align: 'before'})
.addPart('part.navigator', {region: 'left-top', relativeTo: 'part.explorer', align: 'after'})


.addPart('part.explorer', {region: 'left-top'})

.addPart('part.project-top', {region: 'left-top'})
.addPart('part.project-bottom', {relativeTo: 'part.project-top', align: 'bottom')


.addActivity('activity.explorer', {region: 'left-top'})

.addActivity('activity.project-top', {region: 'left-top'})
.addPart('part.project-bottom', {relativeTo: 'part.project-top', align: 'bottom')


# How to provide MetaData
Vorschlag Metadata ins Layout:
% in string
```ts
interface PartMetaData {
  icon?: string;
  label?: string;
  tooltip?: string;
  title?: string;
}
```

Explizite keys
```ts
interface PartMetaData {
  icon?: string;
  label?: string | {key: string};
  tooltip?: string | {key: string};
  title?: string | {key: string};
}
```

### Variante 1 Icon/Text Provider
```ts
provideWorkbench({
  textProvider: (key: string): string => '',
  iconProvider: (icon: string): Component => {},
  layout: factory => factory.addPart(MAIN_AREA)
});
```

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
  
# Model Thinktank

## WorkbenchLayout

```ts
import {MPartGrid} from './workbench-layout.model';

interface WorkbenchLayout {
   workbenchGrid: MPartGrid;
   mainAreaGrid?: MPartGrid;
   activityRegions?: ActivityRegions; // Varianten: activityLayout, activityRegions, regions, regionLayout
}

export interface ActivityRegions {
  left?: {
    top?: ActivityRegion;
    bottom?: ActivityRegion;
    width: string;
    ratio?: string;
  }
  right?: {
    top?: ActivityRegion;
    bottom?: ActivityRegion;
    width: string;
    ratio?: string;
  }
  bottom?: {
    left?: ActivityRegion;
    right?: ActivityRegion;
    height: string;
    ratio?: string;
  }
}

export interface ActivityRegion {
   activities: Activity[];
   activeActivityId?: ActivityId;
}

export interface Activity {
   id: ActivityId;
   element: MPart | MPartGrid; // Varianten: element, content, layout
   hidden?: boolean; // Needed in first iteration?
}

type ActivityId = `activity.${string}`;
```

```ts
export interface MPerspectiveLayout {
   referenceLayout: {
      workbenchGrid: string;
      activityRegions?: string;
      outlets: string;
   };
   userLayout: {
      workbenchGrid: string;
      activityRegions?: string;
      outlets: string;
   };
}
```

## REVIEW










