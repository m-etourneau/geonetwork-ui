import { Component, OnInit } from '@angular/core';
import { RouterFacade } from '@geonetwork-ui/feature/router'
import { FIELDS_BRIEF, SearchFacade } from '@geonetwork-ui/feature/search'
import { CatalogRecord } from '@geonetwork-ui/common/domain/model/record'
import { Observable } from 'rxjs';

@Component({
  selector: 'gn-ui-maps-recent-page',
  templateUrl: './maps-recent-page.component.html',
  styleUrl: './maps-recent-page.component.css'
})
export class MapsRecentPageComponent implements OnInit {
  records$: Observable<CatalogRecord[]>;

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
          'map': true
        }
      })
      
      this.records$ = this.searchFacade.results$; 
      // console.log("records: ",this.records$ );
      
  }

  onMapClick(metadata: CatalogRecord): void {
    this.routerFacade.goToMetadata(metadata)
  }
}
