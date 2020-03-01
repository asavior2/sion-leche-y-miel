import { Component, OnInit, ViewChild } from '@angular/core';
import {BibliaService} from '../services/biblia.service';
import Libros from '../../assets/libros.json';
import { IonContent, AlertController} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { TabsPage } from "../tabs/tabs.page";
import {DomSanitizer} from '@angular/platform-browser';
import { ActionSheetController } from '@ionic/angular';
import {AngularFirestore} from "@angular/fire/firestore"
import { Platform } from '@ionic/angular';
import { Clipboard } from '@ionic-native/clipboard/ngx';


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
  fontSize = 3;
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
  textoJsonFinal = [];
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

  @ViewChild(IonContent) ionContent: IonContent;
  constructor(private bibliaService: BibliaService,
              public actionSheetController: ActionSheetController,
              public http: HttpClient,
              private storage: Storage,
              private sanitizer: DomSanitizer,
              public alertController: AlertController,
              private platform: Platform,
              private db: AngularFirestore,
              private clipboard: Clipboard,
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
      if (val == null){
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
    
    this.bibliaService.getUser().subscribe(datas => {
      datas.map( data =>{
        console.log(data.payload.doc.data())
      }) 
      //console.log(data);
      //return (data);
    });
    
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
  actualizarLibroTitulo(libro){
    for (let entry of Libros) {
      if (libro == entry.id) {
        this.librot = entry.libro;
      }
    }
    this.getcapitulos(libro);
  }

  mostrarTextoMetodo(libro, capitulo) {
    this.citas = [];
    this.storage.set('libro', libro);
    this.storage.set('capitulo', capitulo);
    this.storage.get(libro.toString()).then((val) => {
      if (val == null){
        this.marcador = [];
      }else {
        console.log("marcador "+val);
        this.marcador = val;
      }
      
    });
    this.mostrarCapitulos = false;
    this.libro = libro;
    this.capitulo = capitulo;
    this.actualizarLibroTitulo(this.libro);
    
    this.bibliaService.getCitas(this.libro, this.capitulo).subscribe(data => {
      console.log(data);
      this.citas = data;
      if (this.citas != null){
        this.hayCitas = true;
        //console.log (this.citas);
      }
    });
    this.capitulo = capitulo;
    this.bibliaService.getTitulo(this.libro, this.capitulo).subscribe(data => {
      console.log(data);
      this.titulos = data;
    });
    this.bibliaService.getTexto(this.libro, this.capitulo).subscribe(data => {
      console.log(data);
      this.textoJson = data;
      this.organizarCitas(this.textoJson);
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
     console.log(this.cantCapitulo.length);
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

      let cont =0;
      for (let citaVersiculo of this.mapCita) {
        this.versiculoTEMP = citaVersiculo.versiculo;
        //este if es porque hay casos donde hay dos citas en el medio del versiculo y no se colocaba el resto del versiculo, por esto se crea este if para ver si es el ultimo registro. relacionado al parteText
        if(cont === (this.mapCita.length - 1)) {
          //console.log(this.mapCita.length);
          //console.log("ultimo");
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
  console.log(this.textoJsonFinal);


}
// ________________________________________________________________________________________________
/*  
pruebaversiculo(ver){
    if(ver==false){
      this.tempVersiculo = false;
    }else{
      this.tempVersiculo = true;
    }
    
  }

  mantenerVersiculo(versiculoTemp){
    if(versiculoTemp == 999) {
      this.imprimirVersiculo++;
      return(this.imprimirVersiculo);
    } else {
      this.imprimirVersiculo = versiculoTemp;
    }
    
  }*/
  citaAlert(cita,idLibroCita, capituloC, verInicial, verFinal){
    if (verInicial == verFinal || verFinal == "0"){
      console.log ("versiculo inicial: " + verInicial + "versiculo final: " + verFinal );
      console.log("estamos en el IF");
      this.bibliaService.getTexto(idLibroCita, capituloC).subscribe(data => {
        console.log(data);
        this.arregloTextoCita = data;
        console.log ("Texto cita" + this.arregloTextoCita);
        for (let citaText of this.arregloTextoCita){
          if(verInicial === citaText.versiculo){
            this.textoCita = citaText.texto;
          }
        }
        this.mostrarCitaAlert(cita,this.textoCita,idLibroCita,capituloC);
      });
    } else {
      console.log("estamos en el else");
      this.bibliaService.getTexto(idLibroCita, capituloC).subscribe(data => {
        console.log(data);
        this.arregloTextoCita = data;
        console.log ("Texto cita" + this.arregloTextoCita);
        let cuantosVerSon = verFinal - verInicial;
        for (let citaText of this.arregloTextoCita){
          let contador = 1;
          if( contador  <= cuantosVerSon){
            if(verInicial === citaText.versiculo){
              this.textoCita += citaText.texto;
            }
          }
          contador++;
          }
        this.mostrarCitaAlert(cita,this.textoCita,idLibroCita,capituloC);
      });
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
      mode: "ios"
    });
    await alert.present();
  }
  posicionarcita(cita, text){
    console.log(this.contadorCitas);
    this.contadorCitas=0;
    this.posicion = text.texto.indexOf(cita.palabraAntes,0);
    console.log(text);
    console.log(cita);
    //this.versiculoCompleto =

    if ( this.posicion >= 0){
      this.posicion = this.posicion + cita.palabraAntes.length;
      //this.primeraParteText = text.texto.substring(0,this.posicion);
      //this.segundaParteText = text.texto.substring(this.posicion,text.texto.length);

      console.log("Se encuentra en: " + this.posicion);
    }else{
      //Esta errada una cita, colocar al final.
    } 
  }

  buscarVersiculo (idLibro,capitulo, versiculo){
    this.bibliaService.getTexto(idLibro, capitulo).subscribe(data => {
      //console.log(data);
      this.dataTemp = data;
      //console.log ("Texto cita" + this.arregloTextoCita);
      for (let text of this.dataTemp){
        if(versiculo === text.versiculo){
          console.log (text.texto);
          this.textTemp = text.texto;
        }
      }
    });
  }

  async seleccionarVersiculo(texto, idLibro, capitulo,versiculo) {
    await this.buscarVersiculo(idLibro, capitulo, versiculo);
    const actionSheet = await this.actionSheetController.create({
      mode: "ios",
      buttons: [{
          text: 'Copiar',
          role: 'destructive',
          icon: 'copy',
          handler: () => {
            
            //con ojito habia que consutar el el versiculo y sin ojito no, deje que siempre lo consultara.
            /*
            if (texto === "noText") {
              this.textTemp = await this.buscarVersiculo(idLibro, capitulo, versiculo);
            } else {
              this.textTemp = texto;
            }*/
            //console.log ("\"" + this.textTemp + "\" " + this.librot + " " + capitulo + ":" + versiculo + ' Biblia SLM http://sionlecheymiel.org.ve/');
            this.clipboard.copy("\"" + this.textTemp + "\" " + this.librot + " " + capitulo + ":" + versiculo + ' Biblia SLM http://sionlecheymiel.org.ve/');
          }
        },
        {
          text: "Marcar versículo",
          icon: 'heart',
          handler: () => {
            //llamar funcion 
            this.guardarMarcador(idLibro, capitulo, versiculo);
          }
        }
      ]

      });
      await actionSheet.present();
    }
    

  aumentarSize() {
    this.fontSize++;
  }
  disminuirSize() {
    this.fontSize--
  }

  guardarMarcador(libro, capitulo, versiculo){
    console.log("estamos en marcador");
    console.log(this.marcador);
    const resultadoMarcador = this.marcador.find( marcador => marcador.capitulo === capitulo && marcador.versiculo === versiculo);
    console.log(resultadoMarcador);
    if (resultadoMarcador === undefined){
      this.marcador.push({capitulo: capitulo,
                          versiculo: versiculo});
      this.storage.set(libro, this.marcador);
    }

    //console.log(this.marcadorLibro);
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
