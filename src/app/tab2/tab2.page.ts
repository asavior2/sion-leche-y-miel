import { Component } from '@angular/core';
import {BibliaService} from '../services/biblia.service';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import {FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import Libros from '../../assets/libros.json';
import SLM from '../../assets/SLM.json';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  versiculos:Array<any> = new Array();
  palabra;
  libros;
  librot: string;
  textoJson;
  result:string;
  name:string;
  concordanciaForm: FormGroup;
  showText = false;
  posicionPalabra: number;
  mayuscula = false;
  progreso = false;
  colorProgress = "danger";
  contVersiculos = 0;
  buferVersiculos = 99;
  masResult = false;
  fontSize;

  // Documentacion de formulario login https://www.youtube.com/watch?v=2vVxieW-yyE

  constructor(private  bibliaService: BibliaService,
              private storage: Storage,
              public formBuilder: FormBuilder,
              public loadingController: LoadingController,
              public http: HttpClient) {

    this.concordanciaForm = this.formBuilder.group({
      palablaBuscar: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(30)
      ]))
    });
    this.storage.get('fontSize').then((val) => {
      if (val == null) {

        this.fontSize = 4;
      } else {
        this.fontSize = val;
      }
    });


  } // Constructor



  // Evento del boton
  getItems() {
    if (this.contVersiculos !== 0) {
      this.buferVersiculos += 100;
      this.contVersiculos = 0;
      if (this.palabra !== this.concordanciaForm.value.palablaBuscar ) {
        this.buferVersiculos = 99;
      }
    }
    this.palabra = this.getCleanedString(this.concordanciaForm.value.palablaBuscar);
    if (this.palabra.length > 3) {
      this.versiculos = [];
      for (let entry of JSON.parse(JSON.stringify(SLM))) {
        var re = new RegExp(this.palabra, 'i');
        // this.getCleanedString(entry.texto);
        this.posicionPalabra = this.getCleanedString(entry.texto).search(re);
        if (this.posicionPalabra !== -1) {
          if (this.contVersiculos < this.buferVersiculos){
            entry['palabra'] = entry.texto.substring(this.posicionPalabra,(this.posicionPalabra + this.palabra.length));
            entry['posicionPalabra'] = this.posicionPalabra;
            this.librot = this.getlibroId(entry.id_libro);
            entry['nombreLibro'] = this.librot;
            this.versiculos.push(entry);
            this.contVersiculos++;
          }
        }
      }
      if (this.versiculos.length == 0){
        this.presentLoadingWithOptions();
      } else {
        this.showText = true;
        // console.log (this.versiculos.length);
      }
      // this.progreso = false;
    }
    this.masResult = true;
  }


  getCleanedString(cadena) {
    cadena = cadena.replace(/á/gi,"a");
    cadena = cadena.replace(/Éxodo/gi,"Exodo");
    cadena = cadena.replace(/é/gi,"e");
    cadena = cadena.replace(/í/gi,"i");
    cadena = cadena.replace(/ó/gi,"o");
    cadena = cadena.replace(/ú/gi,"u");
    return cadena;
  }
  getlibroId(id){
    for (let entry of Libros) {
      if (id === entry.id) {
        return(entry.libro);
      }
    }
  }
  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Espere un momento',
      duration: 2000
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();

    console.log('Loading dismissed!');
  }

  async presentLoadingWithOptions() {
    const loading = await this.loadingController.create({
      spinner: null,
      duration: 2000,
      message: 'NO SE ENCONTRÓ RESULTADOS...',
      backdropDismiss: true,
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    return await loading.present();
  }

}
