import { Component, input } from '@angular/core';
import { Indicator } from '../../models/indicator.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  title = input<string>('');
  indicators = input<Indicator[]>([]);
}