import { ChangeDetectionStrategy, Component } from '@angular/core'
import { MetadataLink, MetadataLinkValid } from '@geonetwork-ui/util/shared'
import { map, startWith, switchMap } from 'rxjs/operators'
import { MdViewFacade } from '../state'
import { combineLatest, from, of } from 'rxjs'
import {
  downloadFormats,
  getFormat,
  getLinksWithWfsFormats,
  getWfsDisplayFormat,
} from '../links/link-utils'

@Component({
  selector: 'gn-ui-data-downloads',
  templateUrl: './data-downloads.component.html',
  styleUrls: ['./data-downloads.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataDownloadsComponent {
  constructor(public facade: MdViewFacade) {}

  links$ = this.facade.downloadLinks$.pipe(
    switchMap((links) => {
      const wfsLinks = links.filter((link) =>
        link.protocol.startsWith('OGC:WFS')
      )
      const otherLinks = links
        .filter((link) => !link.protocol.startsWith('OGC:WFS'))
        .map((link) => ({
          ...link,
          format: getFormat(link, downloadFormats),
        }))

      return combineLatest(
        wfsLinks.map((link) => from(getLinksWithWfsFormats(link)))
      ).pipe(
        map(
          (wfsDownloadLinks) =>
            wfsDownloadLinks.reduce((prev, curr) => [...prev, ...curr]),
          []
        ),
        map((wfsDownloadLinks) =>
          wfsDownloadLinks
            .map((link) => ({
              ...link,
              format: getWfsDisplayFormat(link, downloadFormats),
            }))
            .filter((link) => link.format !== undefined)
        ),
        map((wfsDownloadLinks) => [...otherLinks, ...wfsDownloadLinks]),
        startWith(otherLinks)
      )
    })
  )
}
