import { ComponentFixture, TestBed } from '@angular/core/testing'
import { UtilI18nModule } from '@geonetwork-ui/util/i18n'
import { TranslateModule } from '@ngx-translate/core'
import { MetadataQualityItemComponent } from './metadata-quality-item.component'
import { By } from '@angular/platform-browser'
import { ChangeDetectionStrategy } from '@angular/core'

describe('MetadataQualityInfoComponent', () => {
  let component: MetadataQualityItemComponent
  let fixture: ComponentFixture<MetadataQualityItemComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MetadataQualityItemComponent,
        UtilI18nModule,
        TranslateModule.forRoot(),
      ],
    })
      .overrideComponent(MetadataQualityItemComponent, {
        set: { changeDetection: ChangeDetectionStrategy.Default },
      })
      .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataQualityItemComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('title ok', () => {
    component.name = 'title'
    component.value = true
    fixture.detectChanges()

    expect(component.icon).toBe('matCheck')

    const textElement = fixture.debugElement.query(By.css('.text'))
    expect(textElement.nativeElement.innerHTML).toBe(
      'record.metadata.quality.title.success'
    )
  })

  it('title ko', () => {
    component.name = 'title'
    component.value = false
    fixture.detectChanges()

    expect(component.icon).toBe('matWarningAmber')

    const textElement = fixture.debugElement.query(By.css('.text'))
    expect(textElement.nativeElement.innerHTML).toBe(
      'record.metadata.quality.title.failed'
    )
  })

  it('description ok', () => {
    component.name = 'description'
    component.value = true
    fixture.detectChanges()

    expect(component.icon).toBe('matCheck')

    const textElement = fixture.debugElement.query(By.css('.text'))
    expect(textElement.nativeElement.innerHTML).toBe(
      'record.metadata.quality.description.success'
    )
  })

  it('description ko', () => {
    component.name = 'description'
    component.value = false
    fixture.detectChanges()

    expect(component.icon).toBe('matWarningAmber')

    const textElement = fixture.debugElement.query(By.css('.text'))
    expect(textElement.nativeElement.innerHTML).toBe(
      'record.metadata.quality.description.failed'
    )
  })
})
