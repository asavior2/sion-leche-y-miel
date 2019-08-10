import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BibliaService {

  constructor(public http: HttpClient) { }

  // esto trae los versiculos   ("libros/"+libro+"/"+libro+"-"+capitulo+".json")  assets/libros/43/43-3.json
  getTexto(libro: number, capitulo: number) {
    return this.http.get('assets/libros/' + libro + '/' + libro + '-' + capitulo + '.json');
  }
  // Trae los titulos de los respectivo capitulos 
  getTitulo(libro: number, capitulo: number) {
    return this.http.get('assets/libros/' + libro + '/' + libro + '-' + capitulo + 'titulo.json');
  }
  // Trae los libro capitulos y numero de capitulos
  getLibros() {
    return this.http.get('assets/libros.json');
  }

  getTextoBiblia() {
    return this.http.get('assets/SLM.json');
  }


}
