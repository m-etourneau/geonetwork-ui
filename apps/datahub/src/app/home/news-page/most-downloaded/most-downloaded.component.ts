import { Component, OnInit } from '@angular/core';
import { FIELDS_BRIEF, SearchFacade } from '@geonetwork-ui/feature/search'
import { CatalogRecord } from '@geonetwork-ui/common/domain/model/record'
import { Observable } from 'rxjs';

@Component({
  selector: 'gn-ui-most-downloaded',
  templateUrl: './most-downloaded.component.html',
  styleUrl: './most-downloaded.component.css'
})
export class MostDownloadedComponent implements OnInit {
  records$: Observable<CatalogRecord[]>;

  constructor(
    private searchFacade: SearchFacade,
  ) { }

  ngOnInit() {
    this.searchFacade
      .setConfigRequestFields([...FIELDS_BRIEF, 'createDate', 'changeDate'])
      .setPageSize(10)
      .setSortBy(['desc', 'dateStamp'])
      .setResultsLayout('FEED')
      .setConfigFilters({
        'th_otherKeywords-.default': {
          SPRC: true
        },
        'resourceType': {
          // 'map': true
        },
       
      })
      
      // this.searchFacade.results$.subscribe(results => {
      //   console.log('Résultats du composant most down:', results);
      // });
      
      this.records$ = this.searchFacade.results$; 
      // console.log("records: ",this.records$ );
  }

}
