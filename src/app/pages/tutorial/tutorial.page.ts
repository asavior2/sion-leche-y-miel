import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef, NgZone } from '@angular/core';
import { Storage as IonicStorage } from '@ionic/storage-angular';
import { ModalController } from '@ionic/angular';
import { SwiperContainer } from 'swiper/element';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.page.html',
  styleUrls: ['./tutorial.page.scss'],
})
export class TutorialPage implements OnInit {
  @ViewChild('swiper') swiper!: ElementRef<SwiperContainer>;
  isEnd = false;

  constructor(
    private storage: IonicStorage,
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  ngAfterViewInit() {
    this.swiper.nativeElement.addEventListener('slidechange', (e: any) => {
      const swiper = this.swiper.nativeElement.swiper;
      // Wait a tick to ensure Swiper state is final
      setTimeout(() => {
        this.zone.run(() => {
          this.isEnd = swiper.activeIndex >= 3 || swiper.isEnd;
          this.cdr.detectChanges();
        });
      }, 50);
    });
  }

  ngOnInit() {
  }

  onSlideChange() {
    const swiper = this.swiper.nativeElement.swiper;
    this.zone.run(() => {
      // Hardcoded check: 4 slides total (index 0, 1, 2, 3). Last is 3.
      this.isEnd = swiper.activeIndex >= 3;
      console.log('Slide changed. Index:', swiper.activeIndex, 'isEnd:', this.isEnd);
    });
  }

  nextSlide() {
    this.swiper.nativeElement.swiper.slideNext();
  }

  async finishTutorial() {
    await this.storage.set('has_seen_tutorial', true);
    await this.modalCtrl.dismiss();
  }

}
