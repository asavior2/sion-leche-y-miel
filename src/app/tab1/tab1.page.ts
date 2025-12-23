import { Component, OnInit, ViewChild, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import {BibliaService} from '../services/biblia.service';
import Libros from '../../assets/libros.json';
import LibrosHebreo from '../../assets/librosHebreo.json';
import { IonContent, AlertController, NumericValueAccessor} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { HTTP } from '@ionic-native/http/ngx';
import { TabsPage } from "../tabs/tabs.page";
import {DomSanitizer} from '@angular/platform-browser';
import { ActionSheetController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import {Zip} from '@ionic-native/zip/ngx';
import {File} from '@ionic-native/file/ngx';
import { from, Observable } from 'rxjs';
import { async } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  @ViewChild("myButton") myButton: ElementRef;
  libro:number=43;
  LibrosPrueba;
  capitulo:number=3;
  primerP: Array<any> = new Array();
  segundoP: Array<any> = new Array();
  textoJson;
  titulos;
  citas;
  cantCapitulo: any[] = new Array;
  librot:string = '';
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
  textTemp = '';
  marcador: any[] = new Array;
  marcadorLibro: any[] = new Array;
  marcarV;
  zipPath;
  progrss: any="";
  stadoDir: boolean;
  public update: boolean;
  librosTodos;
  librosTodosHebreo;
  tipoOrdenT: boolean;
  tipoOrdenM: boolean;
  tipoOrdenH: boolean;
  tipoOrdenName;
  private fragment: string;
  private sub: Subscription;
  audioMP3:string;
  private win: any = window;
  tiempoAudio;
  colorVar = "blue"
  readVersiculo: boolean = true;
  isPlaying: boolean = false;
  audio;
  idPlay = 0;
  tiempoRecorrido = 0;
  ultimoTiempo = 0;
  playPausa:string ="play";
  share:boolean = false;
  copiaCondensado = [];
  pathDiviceIosAndroid:string;
  darkMode:boolean= true;
  estadoDark:string = "moon";

  @ViewChild(IonContent) ionContent: IonContent;
  constructor(private bibliaService: BibliaService,
              public actionSheetController: ActionSheetController,
              private http: HTTP,
              private httpClient: HttpClient,
              private storage: Storage,
              private sanitizer: DomSanitizer,
              public alertController: AlertController,
              private platform: Platform,
              private clipboard: Clipboard,
              private zip:Zip,
              public file:File,
              public router:Router,
              private activeRoute: ActivatedRoute,
              public tabs: TabsPage,
              private elementRef:ElementRef,
              private renderer: Renderer2) {

                this.tabs.validaUri();
                //this.guardarMarcador();
                this.platform.backButton.observers.pop();
                
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
                this.darkMode = prefersDark.matches;
                if (this.darkMode){
                  this.estadoDark = 'sunny';
                } else {
                  this.estadoDark = 'moon';
                }
                
                
              }

       
  async ngOnInit() {
    console.log("Update 1")
    console.log(this.platform.platforms())

    if (this.platform.is("android")){
      this.pathDiviceIosAndroid = "/files/Documents/"
      console.log("***ANDROID***")
    }else if (this.platform.is("ios")){
      this.pathDiviceIosAndroid = "/Documents/"
      console.log("***IOS***")
    }
   
    //this.activeRoute.fragment.subscribe(fragment => { this.fragment = fragment; });
  

    this.librosTodos = Libros;
    this.librosTodosHebreo = LibrosHebreo;

    await this.storage.get('ordenLibro').then((val) => {
      if (val != null) {
        this.tipoOrdenName = val;
        this.tipoOrdenLibro(val);
      } else {
        this.tipoOrdenT = true;
        this.tipoOrdenName = 'tradicional';
      }
      console.log(this.tipoOrdenName);
    });
    // this.LibrosPrueba = this.getLibros();
    await this.storage.get('libro').then((val) => {
      // console.log(val);
      if (val !== null) {
        this.libro = val;
        for (let entry of Libros) {
          if (val == entry.id){
            this.librot = entry.libro;
          }
        }
        console.log("libro "+ this.libro + " " + this.librot);
      }else{
        this.libro = 43;
        this.librot = 'Juan';
      }
      
    });
    await this.storage.get('fontSize').then((val) => {
      if (val == null || val < 15) {
        this.fontSize = 22;
        this.storage.set("fontSize", this.fontSize);
      } else {
        this.fontSize = val;
      }
    });
    await this.storage.get('capitulo').then((val) => {
      if (val !== null) {
        this.capitulo = val;
        // primer mostrar texto
        this.mostrarTextoMetodo (this.libro, this.capitulo);
        // console.log(val);
      } else {
        this.capitulo = 3;
        this.mostrarTextoMetodo (this.libro, this.capitulo);
      }
    });

 
    await this.storage.set('playAuto', false);
    console.log('1')

    //await this.audioReproductor();

        

    this.storage.get(this.libro.toString()).then((val) => {
      if (val == null) {
        this.marcador = [];
      } else {
        this.marcador = val;
      }
    });

    // this.storage.remove('marcadorLibro');
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
    console.log(this.libro + " ***** " + this.capitulo)
    this.audioMP3 = "assets/audios/"+ this.libro +"/"+ this.capitulo +".mp3"
    this.tiempoAudio = this.bibliaService.getTextoAudio(this.libro, this.capitulo);
    console.log(this.tiempoAudio)
    this.audio = new Audio(this.audioMP3);
    this.audio.load();

    this.audio.addEventListener("play", () => {
      console.log("Inicio el audio reproducción");
    });

    this.audio.addEventListener("ended", () => {
      console.log("finalizo el audio reproducción");

      this.nextboton()
    });*/


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
     this.textoJsonFinal = await this.bibliaService.getTextoImport(this.libro, this.capitulo);

     //this.dataTemp = this.textoJsonFinal = await this.bibliaService.getTextoImport(this.libro, this.capitulo);

    
     
    
  } // ngOnInit

  botonclick(link){
    //this.router.navigate(["/tabs/tab1",'#parte1']);
    let n = "10"
    this.router.navigate( ['/tabs/tab1'], {fragment: n});
  }


  async playAudio(){
    //this.ionContent.scrollToTop(300); //subir scroll al inicio
    let tiempo
    console.log("this.isPlaying " + this.isPlaying)

    if (this.isPlaying){
      //this.isPlaying = false; se pasa al evento
      //if (!this.audio.paused){
      this.audio.pause();
      //}
      await this.storage.set('playAuto', false);   
      console.log("pause")
      this.marcarVersiculoAudioRemove("all")
    }else {
    
      
      this.audio.src = this.audioMP3;
      this.audio.load();
      this.audio.currentTime = this.tiempoRecorrido - this.ultimoTiempo;
      //this.audio.currentTime = 244
      //let listoPlay = true
      //while( listoPlay){     
      //} 
      this.audio.play();
      await this.storage.set('playAuto', false);
      console.log("play")
      
    }
    
  }

  changeDark() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark');
    if (this.darkMode){
      this.estadoDark = 'sunny';
    } else {
      this.estadoDark = 'moon';
    }
  }

  marcarVersiculoAudioAdd(clase) {
    //console.log(clase)
    //this.readVersiculo = !this.readVersiculo;
    document.body.classList.add(clase);   //toggle
  }
  marcarVersiculoAudioRemove(clase) {
    //console.log(clase)
    //this.readVersiculo = !this.readVersiculo;
    document.body.classList.remove(clase);
    if (clase == "all"){
      this.share = false          //Ocultar boton de copia o marcado
      this.copiaCondensado = []   //baciar versiculos seleccionados
      for (let i = 1; i < 177; i ++){
        document.body.classList.remove("readVersiculol" + i);
      }
    }
  }


  ngAfterViewInit(): void {
    this.router.navigate( ['/tabs/tab1'], {fragment: ""});    //Esto es para linpiar el fragment la url #

  }


  async delay(ms: number,tiempo2) {
    if (ms > 1){
        for (let _i = 0; _i < ms*2; _i++) { //ms*2  y time 500 es para solucionar pause play rapido
          if (!this.isPlaying){
            return
          }
          await this.delay2(500);
      }
      await this.delay2(tiempo2);
    }else {
      await this.delay2(tiempo2);
    }
    return
    //return new Promise( resolve => setTimeout(resolve, ms) );
  }
  delay2(ms: number) {
    console.log("delay")
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

   // funcion para cambiar el modo desde el toggle modo dark
  

  async filterListLibro(evt) {
    /** limpiar parece no hacer nada eliminar en otra ocacion  
    if (evt === 'limpiara') { 
      if (this.tipoOrdenH) {
      this.librosTodosHebreo = LibrosHebreo;
      this.librosTodosHebreo = this.librosTodosHebreo.filter(currentLibro => {
        if (currentLibro.libro) {
          return (currentLibro.libro.length > 2);
        }
      });
      } else {
        this.librosTodos = Libros ;
        this.librosTodos = this.librosTodos.filter(currentLibro => {
          if (currentLibro.libro) {
            return (currentLibro.libro.length > 2);
          }
        });
      }
    }*/
    console.log(evt)
    const searchTerm = evt.srcElement.value;
    if (!searchTerm) {
      return;
    }
    
    if (this.tipoOrdenH) {
      console.log('Dentro de tipo OrdenH' + this.tipoOrdenH);
      this.librosTodosHebreo = LibrosHebreo;
      this.librosTodosHebreo = this.librosTodosHebreo.filter(currentLibro => {
        if (currentLibro.libro && searchTerm) {
          return (this.getCleanedString(currentLibro.libro).toLowerCase().indexOf(this.getCleanedString(searchTerm).toLowerCase()) > -1);
        }
      });
    } else {
      this.librosTodos = Libros ;
      this.librosTodos = this.librosTodos.filter(currentLibro => {
        if (currentLibro.libro && searchTerm) {
          return (this.getCleanedString(currentLibro.libro).toLowerCase().indexOf(this.getCleanedString(searchTerm).toLowerCase()) > -1);
        }
      });
    }

  }

  tipoOrdenLibro(libro: string) {
    // console.log(libro);
    if (libro === 'tradicional') {
      this.tipoOrdenT = true;
      this.tipoOrdenM = false;
      this.tipoOrdenH = false;
      this.storage.set('ordenLibro', 'tradicional');
    } else if (libro === 'moderno') {
      this.tipoOrdenT = false;
      this.tipoOrdenM = true;
      this.tipoOrdenH = false;
      this.storage.set('ordenLibro', 'moderno');
    } else {
      this.tipoOrdenT = false;
      this.tipoOrdenM = false;
      this.tipoOrdenH = true;
      this.storage.set('ordenLibro', 'hebreo');
    }
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
        
        console.log(this.cantCapitulo)
      }else{
        console.log("else " + this.cantCapitulo)
      }
    }
    // console.log('Cantidad de capitulos ' + this.cantCapitulo);
  }

  mostrarLibrosMetodo() {
    this.marcarVersiculoAudioRemove("all")
    if (this.mostrarLibros === this.mostrarTexto) {
      this.mostrarCapitulos = false;
      this.mostrarTexto = true;
      this.mostrarLibros = false;
    }
    this.mostrarLibros = !this.mostrarLibros;
    this.mostrarTexto = !this.mostrarTexto;
  }

  mostrarCapitulosMetodo(libro) {
    this.marcarVersiculoAudioRemove("all")
    this.router.navigate( ['/tabs/tab1'], {fragment: ""});
    
    for (let entry of Libros) {
      if (libro === entry.id) {
        this.librot = entry.libro; 
      }
    }
    this.libro = libro;
    this.mostrarTexto = false;
    this.mostrarLibros = false;
    this.getcapitulos(this.libro);
    if (this.mostrarCapitulos === true) {
      this.mostrarTexto = !this.mostrarTexto ;
    }
    this.mostrarCapitulos = !this.mostrarCapitulos;
    // console.log (libro);
    // console.log (capitulo);
  }

  actualizarLibroTitulo(libro) {
    for (let entry of Libros) {
      if (libro === entry.id) {
        this.librot = entry.libro;
      }
    }
    this.getcapitulos(this.libro);
  }
  
  async mostrarTextoMetodo(libro, capitulo) {
    this.ionContent.scrollToTop(300);
    this.marcarVersiculoAudioRemove("all")
    this.router.navigate( ['/tabs/tab1'], {fragment: ""});

    this.citas = [];
    this.storage.set('libro',parseInt(libro));
    this.storage.set('capitulo', capitulo);
    this.storage.get(libro.toString()).then((val) => {
      if (val == null){
        this.marcador = [];
      }else {
        // console.log("marcador "+val);
        this.marcador = val;
      }
    });
    this.mostrarCapitulos = false;
    this.libro = libro;
    this.capitulo = capitulo;
    this.actualizarLibroTitulo(this.libro);

    if (this.isPlaying){
      this.playAudio()
      await this.delay2(900);
      this.idPlay = 0
      this.tiempoRecorrido = 0
      await this.audioReproductor()
    }else{
      this.idPlay = 0
      this.tiempoRecorrido = 0
      console.log("desde no *** audioReproductor")
      await this.audioReproductor()
    }
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
    console.log("textoJsonFinal***********")
    console.log(this.textoJsonFinal)

    this.mostrarTexto = true;
  }

  async audioReproductor(){
    //Validar si el audio existe con readAsText
    
    let promiseAudio = this.file.readAsText(this.file.applicationStorageDirectory + this.pathDiviceIosAndroid, "por-Capitulos/" + this.libro + "/" + this.capitulo + ".mp3");
    if(promiseAudio != undefined){
      await promiseAudio.then((value) => {
        console.log("ARCHIVO  existente ");
        let localAudioURL = this.file.applicationStorageDirectory + this.pathDiviceIosAndroid + "por-Capitulos/" + this.libro + "/" + this.capitulo + ".mp3";
        this.audioMP3 = this.win.Ionic.WebView.convertFileSrc(localAudioURL);
      }).catch(err => {
        console.error(err);
        console.log("ARCHIVO AUDIO no  existente ir a internet ");
        this.audioMP3 = "https://sionlecheymiel.com/file/audios/" + this.libro + "/" + this.capitulo + ".mp3";
      });
    }else{
      this.audioMP3 = "https://sionlecheymiel.com/file/audios/" + this.libro + "/" + this.capitulo + ".mp3";
    }
    //this.audioMP3 = "assets/audios/" + this.libro + "-" + libro + "/" + this.capitulo +".mp3"
    this.tiempoAudio = this.bibliaService.getTextoAudio(this.libro, this.capitulo);
    console.log(this.tiempoAudio)
    console.log("***** " + this.audioMP3)
    

    this.storage.get('playAuto').then((val) => {
      if (val != null && val == true) {

        this.playAudio()
      }
      console.log("playAuto reproductor " + val);
    });

    this.audio = new Audio();

     this.audio.addEventListener("playing", async () => { 
      //playing  Tras una falta de datos, el recurso multimedia vuelve a estar listo para reproducirse.
      this.playPausa = "pause"

      this.isPlaying = true;
      console.log("Event playing");
      let tiempo
      //console.log("Event onplaying");
      //console.log(this.tiempoAudio)
      if (this.tiempoAudio != null){
        this.tiempoRecorrido = 0; 
        for (const entry  of this.tiempoAudio){
          console.log(entry)
          let versiculoAnterior = entry.versiculo - 1
          if (!this.isPlaying){
            this.idPlay = parseInt(entry.id) - 1 ;
            console.log("idPlay")
            console.log(this.idPlay)            
            break;
          }
          //if(this.audio.currentTime){
          //console.log("this.audio.currentTime " + this.audio.currentTime)
          //console.log("this.tiempoRecorrido " + this.tiempoRecorrido)
          //}

          if (parseInt(entry.id) >= this.idPlay){
            if (parseInt(entry.versiculo) > 1){
              this.marcarVersiculoAudioRemove("readVersiculol" + versiculoAnterior)
              this.marcarVersiculoAudioAdd("readVersiculol" + entry.versiculo)
            }else {
              this.marcarVersiculoAudioAdd("readVersiculol" + entry.versiculo)
            }
            ///tiempo = entry.seg*1000
            tiempo = parseInt(entry.seg)
            let tiempoRestante = (entry.seg - tiempo)*1000
            if (entry.versiculo != ""){
              this.router.navigate( ['/tabs/tab1'], {fragment: "l"+entry.versiculo});
            }
            //Siguiente linea es para hacer efecto el route frament [recordar debe existir el id en el html]
            this.sub = this.activeRoute.fragment.pipe(filter(f => !!f)).subscribe(f => document.getElementById(f).scrollIntoView());

            if (tiempo > 1){
              for (let _i = 0; _i < tiempo*2; _i++) { //ms*2  y time 500 es para solucionar pause play rapido
                //if (!this.isPlaying || this.audio.paused){                  
                if (!this.isPlaying ){
                  break
                }
                //console.log("Espero " + 500)
                await new Promise( resolve => setTimeout(resolve, 500) );
              }
              //console.log("Espero " + tiempoRestante)
              await new Promise( resolve => setTimeout(resolve, tiempoRestante) );
            }else {
              //console.log("Espero " + entry.seg*1000)
              await new Promise( resolve => setTimeout(resolve, entry.seg*1000) );
            }
          }
          this.tiempoRecorrido = this.tiempoRecorrido + entry.seg;
          this.ultimoTiempo = entry.seg; 
        }
      }
      
    });

    this.audio.addEventListener("pause", async () => {
      console.log("Event Pause");
      //this.playAudio();
      this.isPlaying = false;
      await this.storage.set('playAuto', false);
      console.log('4')

      this.playPausa = "play"
      this.marcarVersiculoAudioRemove("all")
      /*
      this.isPlaying = !this.isPlaying;
      await this.storage.set('playAuto', false);
      this.playPausa = "play"
      console.log("pause")
      this.marcarVersiculoAudioRemove("all")
      */
    });

    this.audio.addEventListener("ended", async () => {
      await this.storage.set('playAuto', true);
      console.log("Event finalizo el audio reproducción");
      //this.isPlaying = false
      this.nextboton()
    });

    this.audio.addEventListener("loadstart", () => {
      console.log("Event loadstart");
    });
    this.audio.addEventListener("canplaythrough", () => {
      console.log("Event canplaythrough");
    });
    this.audio.addEventListener("waiting", () => {
      //La reproducción se ha detenido por ausencia (temporal) de datos.
      console.log("Event waiting");
      this.isPlaying = false
      this.playPausa = "alert-circle-outline"
    });
    this.audio.addEventListener(".canplay", () => {
      //	La carga del recurso multimedia se ha detenido, pero no por un error.
      console.log("Event .canplay");
      this.isPlaying = false
      this.playPausa = "alert-circle-outline"
    });
    this.audio.addEventListener(".abort", () => {
      //	La carga del recurso multimedia se ha detenido, pero no por un error.
      console.log("Event .abort");
      this.isPlaying = false
      this.playPausa = "alert-circle-outline"
    });
    this.audio.addEventListener(".error", () => {
      //	La carga del recurso multimedia se ha detenido, resultado de un error.
      console.log("Event .error");
      this.isPlaying = false
      this.playPausa = "alert-circle-outline"
    });
  }


  async previousboton() {

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
    this.router.navigate( ['/tabs/tab1'], {fragment: ""});
    this.marcarVersiculoAudioRemove("all")
    
    if (this.isPlaying){
      //this.playAudio()
      await this.delay2(900);
      this.idPlay = 0
      this.tiempoRecorrido = 0
    }else{
      this.idPlay = 0
      this.tiempoRecorrido = 0
    }
   
  }

  async nextboton(){
 
    this.ionContent.scrollToTop(300);
    
    // this.scrollToTop();
    //console.log(this.libro);
    //console.log(this.cantCapitulo);
    //console.log (this.cantCapitulo.length);
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
  this.router.navigate( ['/tabs/tab1'], {fragment: ""});
  this.marcarVersiculoAudioRemove("all")
  
  console.log("Desde Next this.isPlaying " + this.isPlaying )
  if (this.isPlaying ){
    console.log("Desde if next ")
    await this.delay2(1500);
    this.tiempoRecorrido = 0
    this.idPlay = 0

  }else{
    console.log("Desde else next ")
    await this.delay2(1500);
    this.tiempoRecorrido = 0
    this.idPlay = 0
  
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

  console.log(this.textoJsonFinal);


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
                    if (this.isPlaying){
                      this.audio.pause();//Stop
                      this.audio.currentTime = 0;
                      this.idPlay = 0
                      this.tiempoRecorrido = 0  
                      this.router.navigate( ['/tabs/tab1'], {fragment: ""});
                      this.marcarVersiculoAudioRemove("all")
                    }
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
    console.log(idLibro + " -- " + capitulo + " -- " + versiculo)
    if (this.update) {
      await this.bibliaService.getTextoFile(idLibro, capitulo).then((data) => {
        //console.log(data);
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
      //Siguiente linea la movi para ngOnInit, aqui daba peo.
      this.dataTemp = await this.bibliaService.getTextoImport(idLibro, capitulo);
      // console.log ("Texto cita" + this.arregloTextoCita);
      console.log(this.dataTemp)
      for (let text of this.textoJsonFinal) {
        if (versiculo == text.versiculo) {
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
    document.body.classList.toggle("readVersiculol" + versiculo); 
    await this.buscarVersiculo(idLibro, capitulo, versiculo);
    let arreglo = [idLibro, capitulo, versiculo, this.textTemp]
    if (this.copiaCondensado[versiculo] == null){
      this.copiaCondensado[versiculo] = arreglo
      console.log(this.copiaCondensado.length)
    }else{
      this.copiaCondensado.splice(versiculo,1);
      //delete this.copiaCondensado[versiculo]
    }
    let contador = 0 
    for (let clave in this.copiaCondensado){
      contador ++
    }
    //console.log("contador "+ contador);
    if (contador > 0 ){
      this.share = true
    }else{
      this.share = false
    }
    //this.marcarVersiculoAudioRemove("readVersiculol" + versiculoAnterior)
    //this.marcarVersiculoAudioAdd("readVersiculol" + versiculo)
    /* 
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
      */
    }
    
    copiarVersiculo(){
      let textTemp = "";
      for (let clave in this.copiaCondensado){
        textTemp = textTemp + " " + this.copiaCondensado[clave][2] +this.copiaCondensado[clave][3]  
        //console.log(this.copiaCondensado[clave])
      }
      //console.log(textTemp + " " + this.librot + " " + this.capitulo + ":"  + ' Biblia SLM http://sionlecheymiel.com')
      this.clipboard.copy('*Biblia "Sion: Leche y Miel" '+ this.librot + " " + this.capitulo  + '*' + textTemp + ' https://sionlecheymiel.com');
      this.marcarVersiculoAudioRemove("all")
    }
    
    async marcarVersiculo(){
      for (let clave in this.copiaCondensado){
        //this.guardarMarcador(idLibro, capitulo, versiculo);
        await this.guardarMarcador(this.copiaCondensado[clave][0], this.copiaCondensado[clave][1], this.copiaCondensado[clave][2]);
      }
      this.marcarVersiculoAudioRemove("all")
    }

  aumentarSize() {
    if(this.fontSize < 30){
      this.fontSize = this.fontSize + 1;
      this.storage.set("fontSize", this.fontSize);
    }
  }
  disminuirSize() {
    if (this.fontSize >18){
      this.fontSize--
      this.storage.set('fontSize', this.fontSize);
    }
  }

  async guardarMarcador(libro, capitulo, versiculo){
    //console.log(this.marcador);
    const resultadoMarcador = this.marcador.find( marcador => marcador.capitulo === capitulo && marcador.versiculo === versiculo);
    //console.log(resultadoMarcador);
    let indiceMarcador = this.marcador.findIndex(marcador => marcador.capitulo === capitulo && marcador.versiculo === versiculo);
    if (resultadoMarcador === undefined){
      this.marcador.push({capitulo: capitulo,
                          versiculo: versiculo});
      await this.storage.set(libro, this.marcador);
    } else {
      this.marcador.splice(indiceMarcador,1);
      await this.storage.set(libro, this.marcador);
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
