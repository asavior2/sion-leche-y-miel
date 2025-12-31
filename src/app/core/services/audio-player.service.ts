import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface VerseTime {
  versiculo: number;
  start: number;
  end: number;
}

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {

  private audio: HTMLAudioElement;
  private timeMap: VerseTime[] = [];

  // State Observables
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  public isPlaying$ = this.isPlayingSubject.asObservable();

  private currentVerseSubject = new BehaviorSubject<number | null>(null);
  public currentVerse$ = this.currentVerseSubject.asObservable();

  private durationSubject = new BehaviorSubject<number>(0);
  public duration$ = this.durationSubject.asObservable();

  private currentTimeSubject = new BehaviorSubject<number>(0);
  public currentTime$ = this.currentTimeSubject.asObservable();

  constructor() {
    this.audio = new Audio();
    this.initAudioEvents();
  }

  private initAudioEvents() {
    this.audio.addEventListener('playing', () => {
      this.isPlayingSubject.next(true);
    });

    this.audio.addEventListener('pause', () => {
      this.isPlayingSubject.next(false);
    });

    this.audio.addEventListener('ended', () => {
      this.isPlayingSubject.next(false);
      this.currentVerseSubject.next(null);
      this.currentTimeSubject.next(0);
    });

    this.audio.addEventListener('timeupdate', () => {
      const currentTime = this.audio.currentTime;
      this.currentTimeSubject.next(currentTime);
      this.updateCurrentVerse(currentTime);
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.durationSubject.next(this.audio.duration);
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio Error', e);
      this.isPlayingSubject.next(false);
    });
  }

  private updateCurrentVerse(currentTime: number) {
    if (!this.timeMap.length) return;

    const currentEntry = this.timeMap.find(entry => currentTime >= entry.start && currentTime < entry.end);

    if (currentEntry) {
      if (this.currentVerseSubject.value !== currentEntry.versiculo) {
        this.currentVerseSubject.next(currentEntry.versiculo);
      }
    } else {
      // Optional: clear verse if strictly outside mapped ranges (e.g. gaps)
      // For now, steady keeping last known or null is fine.
    }
  }

  /**
   * Loads and plays audio from a source
   * @param src URL or path to the audio file
   * @param timeMapData Optional array of verse timings {versiculo: number, seg: number}
   */
  public async playAudio(src: string, timeMapData?: any[]) {
    // If same source and paused, just resume
    if (this.audio.src === src && this.audio.paused && this.audio.src !== '') {
      try {
        await this.audio.play();
      } catch (err) {
        console.error("Error resuming audio", err);
      }
      return;
    }

    // New Source
    this.audio.src = src;
    await this.audio.load();

    if (timeMapData) {
      this.calculateTimeMap(timeMapData);
    } else {
      this.timeMap = [];
    }

    try {
      await this.audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  public pauseAudio() {
    this.audio.pause();
  }

  public stopAudio() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlayingSubject.next(false);
    this.currentVerseSubject.next(null);
  }

  public seekTo(seconds: number) {
    this.audio.currentTime = seconds;
  }

  public setTimeMap(audioData: any[]) {
    this.calculateTimeMap(audioData);
  }

  private calculateTimeMap(audioData: any[]) {
    this.timeMap = [];
    let currentTime = 0;
    // Map format expected: [{versiculo: 1, seg: 5.5}, ...]
    for (const entry of audioData) {
      const seg = parseFloat(entry.seg) || 0;
      if (entry.versiculo) {
        this.timeMap.push({
          versiculo: parseInt(entry.versiculo),
          start: currentTime,
          end: currentTime + seg
        });
      }
      currentTime += seg;
    }
  }
}
