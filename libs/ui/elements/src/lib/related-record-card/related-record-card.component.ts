import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { CatalogRecord } from '@geonetwork-ui/common/domain/model/record'
import { ThumbnailComponent } from '../thumbnail/thumbnail.component'
import { RouterLink } from '@angular/router'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatButtonModule } from '@angular/material/button'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { TranslateModule } from '@ngx-translate/core'
import { matOpenInNew } from '@ng-icons/material-icons/baseline'

@Component({
  selector: 'gn-ui-related-record-card',
  templateUrl: './related-record-card.component.html',
  styleUrls: ['./related-record-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ThumbnailComponent,
    RouterLink,
    MatTooltipModule,
    MatButtonModule,
    NgIcon,
    TranslateModule,
  ],
  standalone: true,
  viewProviders: [provideIcons({ matOpenInNew })],
})
export class RelatedRecordCardComponent {
  private readonly baseClasses: string

  @Input() record: CatalogRecord
  @Input() extraClass = ''

  constructor() {
    this.baseClasses = [
      'w-72',
      'h-96',
      'overflow-hidden',
      'rounded-lg',
      'bg-white',
      'cursor-pointer',
      'block',
      'hover:-translate-y-2 ',
      'duration-[180ms]',
    ].join(' ')
  }

  get classList() {
    return `${this.baseClasses} ${this.extraClass}`
  }
}
