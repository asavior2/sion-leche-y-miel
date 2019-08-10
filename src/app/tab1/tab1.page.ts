import { Component, OnInit, ViewChild } from '@angular/core';
import {BibliaService} from '../services/biblia.service';
import Libros from '../../assets/libros.json';
import { IonContent } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  libro = 43;
  LibrosPrueba;
  capitulo = 3;
  primerP: Array<any> = new Array();
  segundoP: Array<any> = new Array();
  textoJson;
  titulos;
  cantCapitulo: any[] = new Array;
  librot = 'Juan';
  mostrarLibros = false;
  mostrarCapitulos = false;
  mostrarGenesis = false;
  mostrarTexto = false;
  fontSize = 3;

  @ViewChild(IonContent) ionContent: IonContent;
  constructor(private bibliaService: BibliaService,
              public http: HttpClient,
              private storage: Storage) {}

  ngOnInit() {
    // this.LibrosPrueba = this.getLibros();
    this.storage.get('libro').then((val) => {
      console.log(val);
      if (val !== null) {
        for (let entry of Libros) {
          if (val === entry.id){
            this.librot = entry.libro;
          }
        }
        this.libro = val;
        // console.log(this.libro);
      }
    });
    this.storage.get('capitulo').then((val) => {
      if (val !== null) {
        this.capitulo = val;
        // primer mostrar texto
        this.mostrarTextoMetodo (this.libro, this.capitulo);
        console.log(val);
      } else {
        this.mostrarTextoMetodo (this.libro, this.capitulo);
      }
    });
    this.getcapitulos (this.libro);
    // GetTexto de libro y capitulo en especifico

    // GetTitulo trae titulos de libro y capitulo en especifico
    this.bibliaService.getTitulo(this.libro, this.capitulo).subscribe(data => {
      // console.log(data);
      return (data);
    });
    // los Libros y cantidad de capitulos de cada libro estas console.log(Libros);
    for (const entry of Libros) {
      // let mostrar this.getCleanedString(entry.libro)
      if (+entry.id < 40) {
          this.primerP.push({ id: entry.id, capitulos: entry.capitulos, libro: this.getCleanedString(entry.libro), estado : 'listo'});
      } else {
          this.segundoP.push({id: entry.id, capitulos: entry.capitulos, libro: this.getCleanedString(entry.libro), estado: 'listo'});
      }
    }
    // console.log(this.primerP);
    // console.log(this.segundoP);
  } // ngOnInit

  getLibros() {
    return this.http.get('assets/libros.json');
  }
  // -----------------------------------------------------------------------------------------------------------
  // Para eliminar acentos de los libro y poder crear metodos automatico
  getCleanedString(cadena) {
    cadena = cadena.replace(/á/gi,"a");
    cadena = cadena.replace(/Éxodo/gi,"Exodo");
    cadena = cadena.replace(/é/gi,"e");
    cadena = cadena.replace(/í/gi,"i");
    cadena = cadena.replace(/ó/gi,"o");
    cadena = cadena.replace(/ú/gi,"u");
    cadena = cadena.replace(/ñ/gi,"n");
    return cadena;
  }
// -------------------------------------------------------------------------------------------------------------
// para construir arrray de los capitulos esto es para los botones

 getcapitulos(libro) {
    this.cantCapitulo = [];
    for (const entry of Libros) {
      if (entry.id == libro) {
        for (let _i = 0; _i < +entry.capitulos; _i++) {
          this.cantCapitulo.push(_i + 1);
        }
      }
    }
    // console.log('Cantidad de capitulos ' + this.cantCapitulo);
  }

  mostrarLibrosMetodo() {
    if (this.mostrarLibros === this.mostrarTexto){
      this.mostrarCapitulos = false;
      this.mostrarTexto = true;
      this.mostrarLibros = false;
    }
    this.mostrarLibros = !this.mostrarLibros;
    this.mostrarTexto = !this.mostrarTexto;
  }

  mostrarCapitulosMetodo(libro, capitulo) {
    for (let entry of Libros) {
      if (libro == entry.id) {
        this.librot = entry.libro;
      }
    }
    this.libro = libro;
    this.mostrarTexto = false;
    this.mostrarLibros = false;
    this.getcapitulos(libro);
    if (this.mostrarCapitulos === true){
      this.mostrarTexto = !this.mostrarTexto ;
    }
    this.mostrarCapitulos = !this.mostrarCapitulos;
    // console.log (libro);
    // console.log (capitulo);
  }


  mostrarTextoMetodo(libro, capitulo) {
    this.storage.set('libro', libro);
    this.storage.set('capitulo', capitulo);
    this.mostrarCapitulos = false;
    this.capitulo = capitulo;
    this.bibliaService.getTexto(this.libro, this.capitulo).subscribe(data => {
        // console.log(data);
      this.textoJson = data;
    });
    this.bibliaService.getTitulo(this.libro, this.capitulo).subscribe(data => {
        // console.log(data);
      this.titulos = data;
    });
    this.mostrarTexto = true;
  }

  previousboton() {
    this.ionContent.scrollToTop(300);
    // this.scrollToTop();
    if (this.libro >= 1 && this.capitulo > 1) {
      this.capitulo--; 
      this.mostrarTextoMetodo(this.libro, this.capitulo);
    } else if (this.libro >= 1 && this.capitulo == 1 && this.libro != 1){
        this.libro--;
        this.getcapitulos(this.libro);
        for (let entry of Libros) {
          if (this.libro == +entry.id) {
            this.librot = entry.libro;
            this.capitulo = +entry.capitulos;
          }
        }
        this.mostrarTextoMetodo(this.libro, this.capitulo);
    }
  }

  nextboton(){
    this.ionContent.scrollToTop(300);
    // this.scrollToTop();
    // console.log(this.cantCapitulo.length);
    // console.log (this.cantCapitulo.length);
    if (this.libro <= 66 && this.capitulo < this.cantCapitulo.length){
      this.capitulo++;
      this.mostrarTextoMetodo(this.libro, this.capitulo);
    } else if (this.libro <= 66 && this.capitulo == this.cantCapitulo.length && this.libro !=66){
      this.libro++;
      for (let entry of Libros) {
        if (this.libro == +entry.id){
          this.librot = entry.libro;
          this.capitulo = 1;
        }
      }
      this.mostrarTextoMetodo(this.libro, this.capitulo);
  }
  }
  aumentarSize() {
    this.fontSize++;
  }
  disminuirSize() {
    this.fontSize--
  }



}
