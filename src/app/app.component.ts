import { AfterViewInit, Component, ElementRef, OnDestroy, signal, viewChild } from '@angular/core';
import * as alphaTab from '@coderline/alphatab';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  alphaTabElement = viewChild.required<ElementRef<HTMLDivElement>>('alphaTab');
  alphaTabApi?: alphaTab.AlphaTabApi;

  tracks = signal([] as any[]);
  isLoading = signal(false);

  ngAfterViewInit(): void {
    this.initAlhpaTab();
  }

  initAlhpaTab() {
    this.isLoading.set(true);

    const settings: alphaTab.Settings = {
      core: {
        file: 'https://www.alphatab.net/files/canon.gp',
        fontDirectory: '/font/'
      },
      player: {
        enablePlayer: true,
        enableCursor: true,
        enableUserInteraction: true,
        soundFont: '/soundfont/sonivox.sf3'
      }
    } as alphaTab.Settings;

    if (this.alphaTabElement().nativeElement) {
      this.alphaTabApi = new alphaTab.AlphaTabApi(this.alphaTabElement().nativeElement, settings);

      if (this.alphaTabApi) {
        this.alphaTabApi.scoreLoaded.on((score) => {
          this.tracks.set(score.tracks);
        });

        this.alphaTabApi.renderFinished.on(() => {
          this.isLoading.set(false);
        });
      }
    }
  }

  async playPause() {
    this.alphaTabApi?.playPause();
  }

  async loadTab(event: Event) {
    this.isLoading.set(true);

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      this.alphaTabApi?.load(arrayBuffer);
    }

    this.alphaTabApi?.renderFinished.on(() => {
      this.isLoading.set(false);
    });
  }

  ngOnDestroy(): void {
    this.alphaTabApi?.destroy();
  }
}
