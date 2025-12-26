import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
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
    public file: File) {
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
    const url = '/assets/libros/' + libro + '/' + libro + '-' + capitulo + '.json';
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
      })
    }*/

}
