import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-medals-line-chart',
  templateUrl: './medals-line-chart.component.html',
  styleUrls: ['./medals-line-chart.component.scss'],
})
export class MedalsLineChartComponent implements AfterViewInit, OnDestroy {
  @Input() years: number[] = [];
  @Input() medals: number[] = [];

  @ViewChild('lineCanvas') canvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart<'line', number[], number>;

  ngAfterViewInit(): void {
    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.years,
        datasets: [
          {
            label: 'medals',
            data: this.medals,
            backgroundColor: '#0b868f',
          },
        ],
      },
      options: {
        aspectRatio: 2.5,
      },
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}