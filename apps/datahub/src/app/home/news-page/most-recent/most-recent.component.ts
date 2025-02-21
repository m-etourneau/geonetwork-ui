import { Component, OnInit } from '@angular/core';
import { FIELDS_BRIEF, SearchFacade } from '@geonetwork-ui/feature/search'
import { CatalogRecord } from '@geonetwork-ui/common/domain/model/record'
import { Observable } from 'rxjs';


@Component({
  selector: 'gn-ui-most-recent',
  // standalone: true,
  // imports: [],
  templateUrl: './most-recent.component.html',
  styleUrl: './most-recent.component.css',
})
export class MostRecentComponent implements OnInit  {
  records$: Observable<CatalogRecord[]>;

  constructor(
    private searchFacade: SearchFacade,
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


}
