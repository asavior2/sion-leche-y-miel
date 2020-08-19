import { Component, OnInit, ViewChild } from '@angular/core';
import {BibliaService} from '../services/biblia.service';
import Libros from '../../assets/libros.json';
import { IonContent, AlertController} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';
import { TabsPage } from "../tabs/tabs.page";
import {DomSanitizer} from '@angular/platform-browser';
import { ActionSheetController } from '@ionic/angular';
import {AngularFirestore} from "@angular/fire/firestore"
import { Platform } from '@ionic/angular';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import {Zip} from '@ionic-native/zip/ngx';
import {File} from '@ionic-native/file/ngx';
import { from, Observable } from 'rxjs';
import { async } from '@angular/core/testing';

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
  citas;
  cantCapitulo: any[] = new Array;
  librot = 'Juan';
  mostrarLibros = false;
  mostrarCapitulos = false;
  mostrarGenesis = false;
  mostrarTexto = false;
  public fontSize;
  posicion;

  citaIcon;
  prueba ;
  contadorCitas = 1;
  versiculoCompleto = {
    'datos':[]
  };
  hayCitas = false;
  mapCita = [];
  mapText = [];
  textoJsonFinal: any;
  imprimirVersiculo;
  arregloTextoCita;
  textoCita;
  textoCitaA = [];
  tempVersiculo;
  versiculoTEMP;
  dataTemp;
  textTemp;
  marcador: any[] = new Array;
  marcadorLibro: any[] = new Array;
  marcarV;
  zipPath;
  progrss: any="";
  stadoDir: boolean;
  public update: boolean;

  @ViewChild(IonContent) ionContent: IonContent;
  constructor(private bibliaService: BibliaService,
              public actionSheetController: ActionSheetController,
              private http: HTTP,
              private httpClient: HttpClient,
              private storage: Storage,
              private sanitizer: DomSanitizer,
              public alertController: AlertController,
              private platform: Platform,
              private db: AngularFirestore,
              private clipboard: Clipboard,
              private zip:Zip,
              public file:File,
              public tabs: TabsPage) {
                this.tabs.validaUri();
                //this.guardarMarcador();
                this.platform.backButton.observers.pop();
              }

  async ngOnInit() {
   
    
    // this.LibrosPrueba = this.getLibros();
    await this.storage.get('libro').then((val) => {
      // console.log(val);
      if (val !== null) {
        this.libro = val;
        for (let entry of Libros) {
          if (val === entry.id){
            this.librot = entry.libro;
          }
        }
        // console.log(this.libro);
      }
    });
    this.storage.get('fontSize').then((val) => {
      if (val == null) {
        this.fontSize = 4;
      } else {
        this.fontSize = val;
      }
    });
    this.storage.get('capitulo').then((val) => {
      if (val !== null) {
        this.capitulo = val;
        // primer mostrar texto
        this.mostrarTextoMetodo (this.libro, this.capitulo);
        // console.log(val);
      } else {
        this.mostrarTextoMetodo (this.libro, this.capitulo);
      }
    });


    this.storage.get(this.libro.toString()).then((val) => {
      if (val == null) {
        this.marcador = [];
      } else {
        this.marcador = val;
      }
    });

    //this.storage.remove('marcadorLibro');
    this.storage.get('marcadorLibro').then((val) => {
      if (val == null){
        this.marcadorLibro = [];
      } else {
        this.marcadorLibro = val;
      }
    });

    this.getcapitulos (this.libro);
    // GetTitulo trae titulos de libro y capitulo en especifico
    /*
    this.bibliaService.getTitulo(this.libro, this.capitulo).subscribe(data => {
      // console.log(data);
      return (data);
    });*/
    // los Libros y cantidad de capitulos de cada libro estas console.log(Libros);
    for (const entry of Libros) {
      // let mostrar this.getCleanedString(entry.libro)
      if (+entry.id < 40) {
          this.primerP.push({ id: entry.id, capitulos: entry.capitulos, libro: this.getCleanedString(entry.libro), estado : 'listo'});
      } else {
          this.segundoP.push({id: entry.id, capitulos: entry.capitulos, libro: this.getCleanedString(entry.libro), estado: 'listo'});
      }
    }

    /*
    this.bibliaService.getUser().subscribe(datas => {
      datas.map( data =>{
        console.log(data.payload.doc.data())
      }) 
      //console.log(data);
      //return (data);
    });*/
    // console.log(this.primerP);
    // console.log(this.segundoP);
  } // ngOnInit



  getLibros() {
    return this.httpClient.get('assets/libros.json');
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
  actualizarLibroTitulo(libro){
    for (let entry of Libros) {
      if (libro == entry.id) {
        this.librot = entry.libro;
      }
    }
    this.getcapitulos(libro);
  }

  async mostrarTextoMetodo(libro, capitulo) {
    this.citas = [];
    this.storage.set('libro', libro);
    this.storage.set('capitulo', capitulo);
    this.storage.get(libro.toString()).then((val) => {
      if (val == null){
        this.marcador = [];
      }else {
        //console.log("marcador "+val);
        this.marcador = val;
      }
    });
    this.mostrarCapitulos = false;
    this.libro = libro;
    this.capitulo = capitulo;
    this.actualizarLibroTitulo(this.libro);
    // update es referente a si se actualizo los arquivos JSON que tienen el texto.
    
    await this.storage.get('update').then((val) => {
      if (val == null) {
        this.update = false;
      } else {
        this.update = true;
      }
    });

    if (this.update) {
      await this.bibliaService.getTextoFile(this.libro, this.capitulo).then((data) => {
        // console.log(data);
        this.textoJsonFinal = JSON.parse(data);
      }).catch(err => {
        this.storage.remove('update');
        this.textoJsonFinal = this.bibliaService.getTextoImport(this.libro, this.capitulo);
      });
    } else {
      this.textoJsonFinal = await this.bibliaService.getTextoImport(this.libro, this.capitulo);
    }

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
     //console.log(this.cantCapitulo.length);
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
  
// ______________________________________________________________________________________________
organizarCitas(textoJson){
  this.textoJsonFinal = [];
  for (let text of textoJson) {
    this.mapText = [];
    this.mapCita = [];
    if (this.citas != null) {
      for (let cita of this.citas) {
        
        if (cita.versiculo === text.versiculo) {
          if (text.texto.toLowerCase().indexOf(cita.palabraAntes.toLowerCase(),0)=="-1") {
            this.posicion = text.texto.length;
          }else {
            this.posicion = text.texto.toLowerCase().indexOf(cita.palabraAntes.toLowerCase(),0)+ cita.palabraAntes.length;
          }
          
          this.mapCita.push({
                            palabraAntes: cita.palabraAntes,
                            versiculo: cita.versiculo,
                            cita: cita.cita,
                            libroCita: cita.libroCita,
                            capituloCita : cita.capituloCita,
                            versiculoCitaInicial : cita.versiculoCitaInicial,
                            versiculoCitaFinal : cita.versiculoCitaFinal,
                            posicion: this.posicion
                          });

        }
      }
    } 
    if (this.mapCita.length > 0) {
      this.mapCita.sort((a,b) => a.posicion - b.posicion);
      //console.log("mapCita");
      console.log(this.mapCita);

      var posicionInicial = 0;

      let cont = 0;
      for (let citaVersiculo of this.mapCita) {
        this.versiculoTEMP = citaVersiculo.versiculo;
        // este if es porque hay casos donde hay dos citas en el medio del versiculo y no se colocaba el resto del versiculo, 
        // por esto se crea este if para ver si es el ultimo registro. relacionado al parteText
        if (cont === (this.mapCita.length - 1)) {
          // console.log(this.mapCita.length);
          // console.log("ultimo");
          this.mapText.push({
            id_libro: text.id_libro,
            capitulo: text.capitulo,
            versiculo: citaVersiculo.versiculo,
            cita: citaVersiculo.cita,
            parteText: text.texto.substring(posicionInicial, citaVersiculo.posicion),
            ibroCita: citaVersiculo.libroCita,
            capituloCita : citaVersiculo.capituloCita,
            versiculoCitaInicial : citaVersiculo.versiculoCitaInicial,
            versiculoCitaFinal : citaVersiculo.versiculoCitaFinal,
            posicion: citaVersiculo.posicion,
            parteFinal: text.texto.substring(citaVersiculo.posicion, text.texto.length)
          });
        } else {
          this.mapText.push({
            id_libro: text.id_libro,
            capitulo: text.capitulo,
            versiculo: citaVersiculo.versiculo,
            cita: citaVersiculo.cita,
            parteText: text.texto.substring(posicionInicial,citaVersiculo.posicion),
            ibroCita: citaVersiculo.libroCita,
            capituloCita : citaVersiculo.capituloCita,
            versiculoCitaInicial : citaVersiculo.versiculoCitaInicial,
            versiculoCitaFinal : citaVersiculo.versiculoCitaFinal,
            posicion: citaVersiculo.posicion
            });
        }
        posicionInicial = citaVersiculo.posicion;
        cont++;
      }
      this.textoJsonFinal.push({versiculo: this.versiculoTEMP, comprimido: this.mapText});
      //console.log("mapText");
      //console.log(this.mapText);
      //this.sanitizer.bypassSecurityTrustHtml(this.versiculoFinal);
    } else { 
      this.textoJsonFinal.push(text);
    }
  }
  //console.log(this.textoJsonFinal);


}

// ________________________________________________________________________________________________

  async citaAlert(cita, idLibroCita, capituloC, verInicial) {
    if (this.update) {
      await this.bibliaService.getTextoFile(idLibroCita, capituloC).then((data) => {
        // console.log(data);
        this.arregloTextoCita = JSON.parse(data);
        // console.log ("Texto cita" + this.arregloTextoCita);
        // console.log(this.textoCita);
        for (let citaText of this.arregloTextoCita) {
          if (verInicial === citaText.versiculo) {
            if (citaText.hasOwnProperty('comprimido')) {
              this.textoCita = '';
              for (let texto of citaText.comprimido) {
                this.textoCita = this.textoCita + ' ' + texto.parteText;
                if (texto.hasOwnProperty('parteFinal')) {
                  this.textoCita = this.textoCita + ' ' + texto.parteFinal;
                }
              }
            } else {
              this.textoCita = citaText.texto;
            }
          }
        }
        this.mostrarCitaAlert(cita, this.textoCita, idLibroCita, capituloC);
        // console.log(this.textoCita);
        this.textoCita = '';
      });
    } else {
      this.arregloTextoCita = await this.bibliaService.getTextoImport(idLibroCita, capituloC);
      // console.log ("Texto cita" + this.arregloTextoCita);
      // console.log(this.textoCita);
      for (let citaText of this.arregloTextoCita) {
        if (verInicial === citaText.versiculo) {
          if (citaText.hasOwnProperty('comprimido')) {
            this.textoCita = '';
            for (let texto of citaText.comprimido) {
              this.textoCita = this.textoCita + ' ' + texto.parteText;
              if (texto.hasOwnProperty('parteFinal')) {
                this.textoCita = this.textoCita + ' ' + texto.parteFinal;
              }
            }
          } else {
            this.textoCita = citaText.texto;
          }
        }
      }
      this.mostrarCitaAlert(cita, this.textoCita, idLibroCita, capituloC);
      // console.log(this.textoCita);
      this.textoCita = '';
    }

  }
  async mostrarCitaAlert(cita, textoVersiculo,idLibro, capituloC) {
    const alert = await this.alertController.create({
      header: cita,
      message: "<h6 align=\"center\">" + textoVersiculo + "</h6>",
      buttons: [
                {text:'OK'},
                {
                  text: 'Ir al Capitulo',
                  handler: () => {
                    this.mostrarTextoMetodo(idLibro, capituloC);
                    this.ionContent.scrollToTop(300);
                  }
                }
              ],
      mode: 'ios'
    });
    await alert.present();
  }

  async buscarVersiculo(idLibro, capitulo, versiculo) {
    if (this.update) {
      await this.bibliaService.getTextoFile(idLibro, capitulo).then((data) => {
        // console.log(data);
        this.dataTemp = JSON.parse(data);
        // console.log ("Texto cita" + this.arregloTextoCita);
        for (let text of this.dataTemp) {
          if (versiculo === text.versiculo) {
            if (text.hasOwnProperty('comprimido')) {
              this.textTemp = '';
              for (let texto of text.comprimido){
                this.textTemp = this.textTemp + ' ' + texto.parteText;
                if (texto.hasOwnProperty('parteFinal')) {
                  this.textTemp = this.textTemp + ' ' + texto.parteFinal;
                }
              }
            } else {
              this.textTemp = text.texto;
            }
          }
        }
      });
    } else {
      this.dataTemp = this.textoJsonFinal = await this.bibliaService.getTextoImport(idLibro, capitulo);
      // console.log ("Texto cita" + this.arregloTextoCita);
      for (let text of this.dataTemp) {
        if (versiculo === text.versiculo) {
          if (text.hasOwnProperty('comprimido')) {
            this.textTemp = '';
            for (let texto of text.comprimido){
              this.textTemp = this.textTemp + ' ' + texto.parteText;
              if (texto.hasOwnProperty('parteFinal')) {
                this.textTemp = this.textTemp + ' ' + texto.parteFinal;
              }
            }
          } else {
            this.textTemp = text.texto;
          }
        }
      }
    }
  }

  async seleccionarVersiculo(texto, idLibro, capitulo, versiculo) {
    await this.buscarVersiculo(idLibro, capitulo, versiculo);
    const actionSheet = await this.actionSheetController.create({
      mode: 'ios',
      buttons: [{
          text: 'Copiar',
          role: 'destructive',
          icon: 'copy',
          handler: () => {
            this.clipboard.copy("\"" + this.textTemp + "\" " + this.librot + " " + capitulo + ":" + versiculo + ' Biblia SLM http://sionlecheymiel.org.ve/index.php?libro='+idLibro+'&capitulo='+capitulo);
          }
        },
        {
          text: "Marcar versículo o Eliminar Marca",
          icon: 'heart',
          handler: () => {
            // llamar funcion 
            this.guardarMarcador(idLibro, capitulo, versiculo);
          }
        }
      ]
      });
      await actionSheet.present();
    }

  aumentarSize() {
    if(this.fontSize < 6){
      this.fontSize++;
      this.storage.set("fontSize", this.fontSize);
    }
  }
  disminuirSize() {
    if (this.fontSize >2){
      this.fontSize--
      this.storage.set('fontSize', this.fontSize);
    }
  }

  guardarMarcador(libro, capitulo, versiculo){
    //console.log(this.marcador);
    const resultadoMarcador = this.marcador.find( marcador => marcador.capitulo === capitulo && marcador.versiculo === versiculo);
    //console.log(resultadoMarcador);
    let indiceMarcador = this.marcador.findIndex(marcador => marcador.capitulo === capitulo && marcador.versiculo === versiculo);
    if (resultadoMarcador === undefined){
      this.marcador.push({capitulo: capitulo,
                          versiculo: versiculo});
      this.storage.set(libro, this.marcador);
    } else {
      this.marcador.splice(indiceMarcador,1);
      this.storage.set(libro, this.marcador);
    }

    //Esto es para futuro sincronizar los marcadores
    if (this.marcadorLibro == null) {
      this.marcadorLibro.push({libro});
      this.storage.set('marcadorLibro', this.marcadorLibro);
    } else {
      const resultadoMarcadorLibro = this.marcadorLibro.find( marcador => marcador.libro === libro );
      if (resultadoMarcadorLibro === undefined){
        this.marcadorLibro.push({libro});
        this.storage.set('marcadorLibro', this.marcadorLibro);
      }
    }
  }
  marcar(capitulo, versiculo){
    const resultadoMarcador = this.marcador.find( marcador => marcador.capitulo === capitulo && marcador.versiculo === versiculo);
    if(resultadoMarcador != undefined){
      this.marcarV = 'highlight';
      //return('highlight');
    } else {
      this.marcarV = "";
    }

  }
}
