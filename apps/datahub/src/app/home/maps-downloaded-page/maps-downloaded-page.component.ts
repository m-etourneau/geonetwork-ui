import { Component, OnInit } from '@angular/core';
import { RouterFacade } from '@geonetwork-ui/feature/router'
import { FIELDS_BRIEF, SearchFacade, resetSearchFacade } from '@geonetwork-ui/feature/search'
import { CatalogRecord } from '@geonetwork-ui/common/domain/model/record'
import { Observable } from 'rxjs';

@Component({
  selector: 'gn-ui-maps-downloaded-page',
  templateUrl: './maps-downloaded-page.component.html',
  styleUrl: './maps-downloaded-page.component.css'
})
export class MapsDownloadedPageComponent implements OnInit {
  records$: Observable<CatalogRecord[]>;

  constructor(
    private searchFacade: SearchFacade,
    private routerFacade: RouterFacade
  ) { }

  ngOnInit() {
    // resetSearchFacade(this.searchFacade)
    this.searchFacade
      .setConfigRequestFields([...FIELDS_BRIEF, 'createDate', 'changeDate'])
      .setPageSize(10)
      .setSortBy(['desc', 'dateStamp'])
      .setResultsLayout('FEED')
      .setConfigFilters({
        // 'resourceType': {
        //   'map': true
        // },
        'th_otherKeywords-.default': {
          SPRC: true
        },
      })

      // this.searchFacade.requestNewResults()
      
      this.records$ = this.searchFacade.results$; 
      // console.log("records: ",this.records$ );
  }

  onMapClick(metadata: CatalogRecord): void {
    this.routerFacade.goToMetadata(metadata)
  }
}
