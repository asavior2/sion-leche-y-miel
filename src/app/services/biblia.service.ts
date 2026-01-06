import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { LocalBibleRepository } from '../core/repositories/local-bible.repository';
import { Bookmark, Note } from '../core/repositories/bible.repository';
import { from, Observable } from 'rxjs';
//import { Observable } from "rxjs/Observable";
import { defer } from 'rxjs';
import { of, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class BibliaService {

  dataTemp;
  stadoDir: boolean;
  temporalT;
  temporalA;


  constructor(public http: HTTP,
    private httpClient: HttpClient,
    public file: File,
    private bibleRepo: LocalBibleRepository) {
    //this.genesis = require('../../assets/libros/1/1-2.json');
    //  console.log(this.genesis);
  }


  // esto trae los versiculos   ("libros/"+libro+"/"+libro+"-"+capitulo+".json")  assets/libros/43/43-3.json
  getTexto(libro: number, capitulo: number) {
    return this.httpClient.get('/assets/libros/' + libro + '/' + libro + '-' + capitulo + '.json');
  }

  async getTextoFile(libro: number, capitulo: number) { // Cuando esta actualizado
    return await (this.file.readAsText(this.file.externalDataDirectory + 'libros/' + libro + '/', libro + '-' + capitulo + '.json'));
  }

  /*
  async getAudio() { // Cuando esta actualizado
    return await(this.file.readAsText(this.file.externalDataDirectory + 'audios/2/1/' ,'4-Exodo-1-1--versiculo.mp3'));
    //return await(this.file.readAsText(this.file.externalDataDirectory + 'libros/' + libro + '/',  libro + '-' + capitulo + '.json'));
  }*/


  async getTextoImport(libro: number, capitulo: number) {
    console.log(`Getting text for libro ${libro} capitulo ${capitulo}`);
    const url = '/assets/libros/' + libro + '/' + libro + '-' + capitulo + '.json?t=' + Date.now();
    console.log('Requesting URL:', url);
    return await firstValueFrom(this.httpClient.get(url));
  }

  async getTextoAudio(libro: number, capitulo: number) {
    return await firstValueFrom(this.httpClient.get('/assets/audios-json/' + libro + '/' + capitulo + '.json'));
  }

  // Trae los titulos de los respectivo capitulos 

  /*
  getTitulo(libro: number, capitulo: number) {
    return this.http.get('assets/libros/' + libro + '/' + libro + '-' + capitulo + 'titulo.json');
  }*/

  // Trae los libro capitulos y numero de capitulos
  getLibros() {
    return this.httpClient.get('/assets/libros.json');
  }

  getTextoBiblia() {
    return this.httpClient.get('/assets/SLM.json');
  }

  // Trae las citas de los respectivo capitulos 
  /*
  getCitas(libro: number, capitulo: number) {
    return this.http.get('assets/libros/' + libro + '/' + libro + '-' + capitulo + 'citas.json');
  }*/

  /* 
  getUser(){
    return this.db.collection('PsWHpchzxoFVWDQzfiJj').snapshotChanges()
  }*/
  /* BOrrar
    buscarVersiculo (idLibro,capitulo, versiculo){
      return new Promise((resolve,reject) =>{
        this.getTexto(idLibro, capitulo).subscribe(data => {
          this.dataTemp = data;
          for (let text of this.dataTemp){
            if(versiculo === text.versiculo){
              resolve (text.texto);
            }
          }
        })
      })
    }
  
    
    onLoginGoogle(){
      return new Promise((resolve, reject) =>{
        this.AFauth.auth.signInWithPopup(new auth.GoogleAuthProvider()).then ( res =>{
          console.log (res);
          resolve(res);
        }).catch (err => reject(err))
      
    }*/

  // --- REPOSITORY ACCESS (Centralized Data) ---

  async getBookmarks(bookId: number): Promise<Bookmark[]> {
    const all = await this.bibleRepo.getBookmarks();
    return all.filter(b => b.book_id === bookId);
  }

  async getBookmark(bookId: number, chapter: number, verse: number): Promise<Bookmark | undefined> {
    return this.bibleRepo.getBookmark(bookId, chapter, verse);
  }

  async saveBookmark(bookmark: Bookmark): Promise<void> {
    await this.bibleRepo.saveBookmark(bookmark);
  }

  async deleteBookmark(id: string): Promise<void> {
    await this.bibleRepo.deleteBookmark(id);
  }

  async deleteBookmarkByRef(bookId: number, chapter: number, verse: number): Promise<void> {
    const existing = await this.bibleRepo.getBookmark(bookId, chapter, verse);
    if (existing) {
      await this.bibleRepo.deleteBookmark(existing.id);
    }
  }

  // --- NOTES (Added for Phase 7) ---
  async getNotes(): Promise<Note[]> {
    return this.bibleRepo.getNotes();
  }

  async saveNote(note: Note): Promise<void> {
    await this.bibleRepo.saveNote(note);
  }

  async deleteNote(id: string): Promise<void> {
    await this.bibleRepo.deleteNote(id);
  }

  // --- READING PROGRESS ---
  async getReadingProgress(planId: string): Promise<any[]> {
    return this.bibleRepo.getReadingProgress(planId);
  }

  async saveReadingProgress(planId: string, dayId: number, status: number): Promise<void> {
    // Find existing to update or create new? Schema has ID. 
    // Ideally we want upsert logic handled by ID or unique constraint on (plan_id, day_id).
    // Repo implementation: saveReadingProgress does INSERT OR REPLACE.
    // But we need an ID.
    // Let's check if it exists or use deterministic ID? 
    // Using deterministic ID (md5 of plan+day) or just querying first is strictly better to avoid duplicates if ID is random.
    // For now, let's query.
    const existing = (await this.bibleRepo.getReadingProgress(planId)).find(p => p.day_id === dayId);

    const progress = {
      id: existing ? existing.id : this.generateUUID(),
      plan_id: planId,
      day_id: dayId,
      status: status, // 1 for complete, 0 for incomplete
      completed_at: Date.now(),
      is_synced: 0
    };
    await this.bibleRepo.saveReadingProgress(progress);
  }

  private _navigationHistory: { libro: number, capitulo: number, versiculo: number } | null = null;

  get navigationHistory() {
    return this._navigationHistory;
  }

  setHistory(libro: number, capitulo: number, versiculo: number) {
    this._navigationHistory = { libro, capitulo, versiculo };
  }

  clearHistory() {
    this._navigationHistory = null;
  }

  private generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


}
