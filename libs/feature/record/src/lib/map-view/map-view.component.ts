import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  ViewChild,
} from '@angular/core'
import { MapUtilsService } from '@geonetwork-ui/feature/map'
import { getLinkLabel } from '@geonetwork-ui/util/shared'
import {
  BehaviorSubject,
  combineLatest,
  from,
  Observable,
  of,
  startWith,
  throwError,
  withLatestFrom,
} from 'rxjs'
import {
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators'
import { MdViewFacade } from '../state/mdview.facade'
import { DataService } from '@geonetwork-ui/feature/dataviz'
import { DatasetOnlineResource } from '@geonetwork-ui/common/domain/model/record'
import {
  createViewFromLayer,
  MapContext,
  MapContextLayer,
  SourceLoadErrorEvent,
} from '@geospatial-sdk/core'
import {
  FeatureDetailComponent,
  MapContainerComponent,
  MapLegendComponent,
  prioritizePageScroll,
} from '@geonetwork-ui/ui/map'
import { Feature } from 'geojson'
import { NgIconComponent, provideIcons } from '@ng-icons/core'
import { matClose } from '@ng-icons/material-icons/baseline'
import { CommonModule } from '@angular/common'
import {
  ButtonComponent,
  DropdownSelectorComponent,
} from '@geonetwork-ui/ui/inputs'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { ExternalViewerButtonComponent } from '../external-viewer-button/external-viewer-button.component'
import {
  LoadingMaskComponent,
  PopupAlertComponent,
} from '@geonetwork-ui/ui/widgets'
import { marker } from '@biesbjerg/ngx-translate-extract-marker'
import { FetchError } from '@geonetwork-ui/data-fetcher'

marker('map.dropdown.placeholder')
marker('wfs.feature.limit')
marker('dataset.error.restrictedAccess')

@Component({
  selector: 'gn-ui-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    DropdownSelectorComponent,
    MapContainerComponent,
    FeatureDetailComponent,
    PopupAlertComponent,
    TranslateModule,
    LoadingMaskComponent,
    NgIconComponent,
    ExternalViewerButtonComponent,
    ButtonComponent,
    MapLegendComponent,
  ],
  viewProviders: [provideIcons({ matClose })],
})
export class MapViewComponent implements AfterViewInit {
  @Input() set exceedsLimit(value: boolean) {
    this.excludeWfs$.next(value)
  }
  @Input() displaySource = true
  @ViewChild('mapContainer') mapContainer: MapContainerComponent

  excludeWfs$ = new BehaviorSubject(false)
  hidePreview = false
  selection: Feature
  showLegend = true
  legendExists = false

  toggleLegend() {
    this.showLegend = !this.showLegend
  }

  onLegendStatusChange(status: boolean) {
    this.legendExists = status
  }

  compatibleMapLinks$ = combineLatest([
    this.mdViewFacade.mapApiLinks$,
    this.mdViewFacade.geoDataLinksWithGeometry$,
  ]).pipe(
    switchMap(async ([mapApiLinks, geoDataLinksWithGeometry]) => {
      // looking for TMS links to process
      let processedMapApiLinks = await Promise.all(
        mapApiLinks.map((link) => {
          if (link.type === 'service' && link.accessServiceProtocol === 'tms') {
            return this.dataService.getGeodataLinksFromTms(link)
          }
          return link
        })
      )
      processedMapApiLinks = processedMapApiLinks.flat()
      return [...processedMapApiLinks, ...geoDataLinksWithGeometry]
    }),
    shareReplay(1)
  )

  dropdownChoices$ = this.compatibleMapLinks$.pipe(
    map((links) =>
      links.length
        ? links.map((link, index) => ({
            label: getLinkLabel(link),
            value: index,
          }))
        : [{ label: 'map.dropdown.placeholder', value: 0 }]
    )
  )
  selectedLinkIndex$ = new BehaviorSubject(0)

  loading = false
  error = null

  selectedLink$ = combineLatest([
    this.compatibleMapLinks$,
    this.selectedLinkIndex$.pipe(distinctUntilChanged()),
  ]).pipe(map(([links, index]) => links[index]))

  currentLayers$ = combineLatest([this.selectedLink$, this.excludeWfs$]).pipe(
    switchMap(([link, excludeWfs]) => {
      if (!link) {
        return of([])
      }
      if (excludeWfs && link.accessServiceProtocol === 'wfs') {
        this.hidePreview = true
        return of([])
      }
      this.hidePreview = false
      this.loading = true
      this.error = null
      if (link.accessRestricted) {
        this.handleError('dataset.error.restrictedAccess')
        return of([])
      }
      return this.getLayerFromLink(link).pipe(
        map((layer) => [layer]),
        catchError((e) => {
          this.handleError(e)
          return of([])
        }),
        finalize(() => (this.loading = false))
      )
    })
  )

  mapContext$: Observable<MapContext> = this.currentLayers$.pipe(
    switchMap((layers) =>
      from(createViewFromLayer(layers[0])).pipe(
        catchError(() => of(null)), // could not zoom on the layer: use the record extent
        map((view) => ({
          layers,
          view,
        })),
        tap(() => {
          this.resetSelection()
        })
      )
    ),
    startWith({
      layers: [],
      view: null,
    }),
    withLatestFrom(this.mdViewFacade.metadata$),
    map(([context, metadata]) => {
      if (context.view) return context
      const extent = this.mapUtils.getRecordExtent(metadata)
      const view = extent ? { extent } : null
      return {
        ...context,
        view,
      }
    }),
    shareReplay(1)
  )

  constructor(
    private mdViewFacade: MdViewFacade,
    private mapUtils: MapUtilsService,
    private dataService: DataService,
    private changeRef: ChangeDetectorRef,
    private translateService: TranslateService
  ) {}

  async ngAfterViewInit() {
    const map = await this.mapContainer.openlayersMap
    prioritizePageScroll(map.getInteractions())
  }

  onMapFeatureSelect(features: Feature[]): void {
    this.resetSelection()
    this.selection = features?.length > 0 && features[0]
    if (this.selection) {
      // FIXME: restore styling of selected feature
      // this.selection.setStyle(this.selectionStyle)
    }
    this.changeRef.detectChanges()
  }

  onSourceLoadError(error: SourceLoadErrorEvent) {
    if (error.httpStatus === 403 || error.httpStatus === 401) {
      this.error = this.translateService.instant(`dataset.error.forbidden`)
    } else {
      this.error = this.translateService.instant(`dataset.error.http`, {
        info: error.httpStatus,
      })
    }
  }

  resetSelection(): void {
    if (this.selection) {
      // FIXME: restore styling of selected feature
      // this.selection.setStyle(null)
    }
    this.selection = null
  }

  getLayerFromLink(link: DatasetOnlineResource): Observable<MapContextLayer> {
    if (link.type === 'service' && link.accessServiceProtocol === 'wms') {
      return of({
        url: link.url.toString(),
        type: 'wms',
        name: link.name,
      })
    } else if (
      link.type === 'service' &&
      link.accessServiceProtocol === 'tms'
    ) {
      // FIXME: here we're assuming that the TMS serves vector tiles only; should be checked with ogc-client first
      return of({
        url: link.url.toString().replace(/\/?$/, '/{z}/{x}/{y}.pbf'),
        type: 'xyz',
        tileFormat: 'application/vnd.mapbox-vector-tile',
        name: link.name,
      })
    } else if (
      link.type === 'service' &&
      link.accessServiceProtocol === 'maplibre-style'
    ) {
      return of({
        type: 'maplibre-style',
        name: link.name,
        styleUrl: link.url.toString(),
      })
    } else if (
      link.type === 'service' &&
      link.accessServiceProtocol === 'wmts'
    ) {
      return of({
        url: link.url.toString(),
        type: 'wmts',
        name: link.name,
      })
    } else if (
      (link.type === 'service' &&
        (link.accessServiceProtocol === 'wfs' ||
          link.accessServiceProtocol === 'esriRest' ||
          link.accessServiceProtocol === 'ogcFeatures')) ||
      link.type === 'download'
    ) {
      const cacheActive = true // TODO implement whether should be true or false
      return this.dataService.readAsGeoJson(link, cacheActive).pipe(
        map((data) => ({
          type: 'geojson',
          data,
        }))
      )
    }
    return throwError(() => 'protocol not supported')
  }

  selectLinkToDisplay(link: number) {
    this.selectedLinkIndex$.next(link)
  }

  handleError(error: FetchError | Error | string) {
    if (error instanceof FetchError) {
      this.error = this.translateService.instant(
        `dataset.error.${error.type}`,
        {
          info: error.info,
        }
      )
      console.warn(error.message)
    } else if (error instanceof Error) {
      this.error = this.translateService.instant(error.message)
      console.warn(error.stack || error)
    } else {
      this.error = this.translateService.instant(error)
      console.warn(error)
    }
    this.loading = false
    this.changeRef.detectChanges()
  }
}
