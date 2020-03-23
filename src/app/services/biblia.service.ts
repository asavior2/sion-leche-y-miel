import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from "@angular/fire/firestore";
import { promise } from 'protractor';
import { resolve } from 'dns';
import { rejects } from 'assert';

@Injectable({
  providedIn: 'root'
})
export class BibliaService {

  dataTemp;

  constructor(public http: HttpClient,
              private db: AngularFirestore){ }

  // esto trae los versiculos   ("libros/"+libro+"/"+libro+"-"+capitulo+".json")  assets/libros/43/43-3.json
  getTexto(libro: number, capitulo: number) {
    return this.http.get('assets/libros/' + libro + '/' + libro + '-' + capitulo + '.json');
  }
  // Trae los titulos de los respectivo capitulos 
  
  /*
  getTitulo(libro: number, capitulo: number) {
    return this.http.get('assets/libros/' + libro + '/' + libro + '-' + capitulo + 'titulo.json');
  }*/

  // Trae los libro capitulos y numero de capitulos
  getLibros() {
    return this.http.get('assets/libros.json');
  }

  getTextoBiblia() {
    return this.http.get('assets/SLM.json');
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
