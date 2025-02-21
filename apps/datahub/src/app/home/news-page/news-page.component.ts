import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Router } from '@angular/router';

@Component({
  selector: 'datahub-news-page',
  templateUrl: './news-page.component.html',
  styleUrls: ['./news-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsPageComponent {

  constructor(private router: Router) {}

  onMostRecentClick():void{
    this.router.navigate(['/maps-recent']);
  }

  onMapsClick():void{
    this.router.navigate(['/maps']);
  }

  onMostDownloadedClick():void{
    this.router.navigate(['/maps-downloaded']);
  }
}
