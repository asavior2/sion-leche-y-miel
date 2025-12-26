import { Component } from '@angular/core';
import { BibliaService } from '../services/biblia.service';
import { Storage as IonicStorage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import Libros from '../../assets/libros.json';
import SLM from '../../assets/SLM.json';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  versiculos: Array<any> = new Array();
  palabra;
  libros;
  librot: string;
  textoJson;
  result: string;
  name: string;
  concordanciaForm: UntypedFormGroup;
  showText = false;
  posicionPalabra: number;
  mayuscula = false;
  progreso = false;
  colorProgress = "danger";
  contVersiculos = 0;
  buferVersiculos = 99;
  masResult = false;
  fontSize;
  partesArray = [];

  // Documentacion de formulario login https://www.youtube.com/watch?v=2vVxieW-yyE

  constructor(private bibliaService: BibliaService,
    private storage: IonicStorage,
    public formBuilder: UntypedFormBuilder,
    public loadingController: LoadingController,
    public http: HttpClient) {

    this.concordanciaForm = this.formBuilder.group({
      palablaBuscar: new UntypedFormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(30)
      ]))
    });
    this.storage.get('fontSize').then((val) => {
      if (val == null) {

        this.fontSize = 22;
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
      if (this.palabra !== this.concordanciaForm.value.palablaBuscar) {
        this.buferVersiculos = 99;
      }
    }
    this.palabra = this.getCleanedString(this.concordanciaForm.value.palablaBuscar);
    if (this.palabra.length > 1) {
      this.versiculos = [];
      for (let entry of JSON.parse(JSON.stringify(SLM))) {
        console.log(entry)
        var re = new RegExp(this.palabra, 'i');
        const re2 = new RegExp("\\b" + this.palabra + "\\b", "gi"); //Consulta mejorada

        this.posicionPalabra = this.getCleanedString(entry.texto).search(re2);
        if (this.posicionPalabra !== -1) {
          if (this.contVersiculos < this.buferVersiculos) {
            entry['palabra'] = entry.texto.substring(this.posicionPalabra, (this.posicionPalabra + this.palabra.length));
            entry['posicionPalabra'] = this.posicionPalabra;
            this.librot = this.getlibroId(entry.id_libro);
            entry['nombreLibro'] = this.librot;
            this.versiculos.push(entry);
            this.contVersiculos++;
          }
        }
      }
      console.log(this.versiculos)
      if (this.versiculos.length == 0) {
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
    cadena = cadena.replace(/á/gi, "a");
    cadena = cadena.replace(/Éxodo/gi, "Exodo");
    cadena = cadena.replace(/é/gi, "e");
    cadena = cadena.replace(/í/gi, "i");
    cadena = cadena.replace(/ó/gi, "o");
    cadena = cadena.replace(/ú/gi, "u");
    //cadena = cadena.replace(/\s/g, "");
    //this.partesArray = cadena.split(" ");
    //console.log(this.partesArray[0]);
    return cadena;
  }
  getlibroId(id) {
    for (let entry of Libros) {
      if (id === entry.id) {
        return (entry.libro);
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
