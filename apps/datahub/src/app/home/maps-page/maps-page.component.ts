import { Component, OnInit } from '@angular/core';
import { RouterFacade } from '@geonetwork-ui/feature/router'
import { FIELDS_BRIEF, SearchFacade } from '@geonetwork-ui/feature/search'
import { CatalogRecord } from '@geonetwork-ui/common/domain/model/record'

@Component({
  selector: 'gn-ui-maps-page',
  templateUrl: './maps-page.component.html',
  styleUrl: './maps-page.component.css'
})
export class MapsPageComponent implements OnInit {
  constructor(
    private searchFacade: SearchFacade,
    private routerFacade: RouterFacade
  ) { }

  ngOnInit() {
    this.searchFacade
      .setConfigRequestFields([...FIELDS_BRIEF, 'createDate', 'changeDate'])
      .setPageSize(10)
      .setSortBy(['desc', 'createDate'])
      .setResultsLayout('FEED')
      .setConfigFilters({
        'resourceType': {
          'service': true,
          'map': true,
          // 'map/static': false,
          // 'mapDigital': false,
        }
      })
  }

  onMetadataSelection(metadata: CatalogRecord): void {
    this.routerFacade.goToMetadata(metadata)
  }
}
