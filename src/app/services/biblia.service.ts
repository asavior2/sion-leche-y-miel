import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';
import {File} from '@ionic-native/file/ngx';
import { from, Observable } from 'rxjs';
//import { Observable } from "rxjs/Observable";
import { defer } from 'rxjs';
import { of } from 'rxjs';
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
    return this.httpClient.get('assets/libros/' + libro + '/' + libro + '-' + capitulo + '.json');
  }

  async getTextoFile(libro: number, capitulo: number) { // Cuando esta actualizado
    return await(this.file.readAsText(this.file.externalDataDirectory + 'libros/' + libro + '/',  libro + '-' + capitulo + '.json'));
  }
  
  /*
  async getAudio() { // Cuando esta actualizado
    return await(this.file.readAsText(this.file.externalDataDirectory + 'audios/2/1/' ,'4-Exodo-1-1--versiculo.mp3'));
    //return await(this.file.readAsText(this.file.externalDataDirectory + 'libros/' + libro + '/',  libro + '-' + capitulo + '.json'));
  }*/

  
  getTextoImport(libro: number, capitulo: number) {
    this.temporalT = require('../../assets/libros/' + libro + '/' + libro + '-' + capitulo + '.json');
    return (JSON.parse(JSON.stringify(this.temporalT)));
  }

  getTextoAudio(libro: number, capitulo: number) {
    this.temporalA = require('../../assets/audios/' + libro + '/' + capitulo + '.json');
    return (JSON.parse(JSON.stringify(this.temporalA)));
  }

  // Trae los titulos de los respectivo capitulos 
  
  /*
  getTitulo(libro: number, capitulo: number) {
    return this.http.get('assets/libros/' + libro + '/' + libro + '-' + capitulo + 'titulo.json');
  }*/

  // Trae los libro capitulos y numero de capitulos
  getLibros() {
    return this.httpClient.get('assets/libros.json');
  }

  getTextoBiblia() {
    return this.httpClient.get('assets/SLM.json');
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
