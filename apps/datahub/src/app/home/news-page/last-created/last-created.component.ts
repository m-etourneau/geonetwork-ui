import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { FIELDS_BRIEF, SearchFacade } from '@geonetwork-ui/feature/search'

@Component({
  selector: 'datahub-last-created',
  templateUrl: './last-created.component.html',
  styleUrls: ['./last-created.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LastCreatedComponent implements OnInit {
  constructor(
    private searchFacade: SearchFacade
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

}
