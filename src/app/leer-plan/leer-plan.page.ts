import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {BibliaService} from '../services/biblia.service';
import Libros from '../../assets/libros.json';
import LibrosHebreo from '../../assets/librosHebreo.json';
import { IonContent, AlertController} from '@ionic/angular';
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
import { NavController } from '@ionic/angular';
import planesFile from '../../assets/planesLectura.json';
//import { ConsoleReporter } from 'jasmine';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-leer-plan',
  templateUrl: './leer-plan.page.html',
  styleUrls: ['./leer-plan.page.scss'],
})
export class LeerPlanPage implements OnInit {

  libro = parseInt(this.activatedRoute.snapshot.paramMap.get('libro'));
  capitulo = parseInt(this.activatedRoute.snapshot.paramMap.get('capitulo'));
  versiculo = parseInt(this.activatedRoute.snapshot.paramMap.get('versiculo'));
  versiculoFinal = parseInt(this.activatedRoute.snapshot.paramMap.get('versiculoFinal'));
  LibrosPrueba;
  primerP: Array<any> = new Array();
  segundoP: Array<any> = new Array();
  textoJson;
  titulos;
  citas;
  cantCapitulo: any[] = new Array;
  librot;
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
  librosTodos;
  librosTodosHebreo;
  tipoOrdenT: boolean;
  tipoOrdenM: boolean;
  tipoOrdenH: boolean;
  tipoOrdenName;
  capituloMenor;
  capituloMayor;
  detalleDia;
  planOfStora;
  dia;
  planes = planesFile;
  nombrePlan;
  planesActivos:Array<any> = new Array();
  cantDetalleDia;
  contParteDia;
  detalleTemp;
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
  botonPlay:boolean=false;
  pathDiviceIosAndroid:string;
  darkMode:boolean= true;
  estadoDark:string = "moon";

  @ViewChild(IonContent, { static: true }) ionContent: IonContent;
  constructor(private activatedRoute: ActivatedRoute,
              private bibliaService: BibliaService,
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
              private navCtrl: NavController,
              public router:Router
              ) { 
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

    if (this.platform.is("android")){
      this.pathDiviceIosAndroid = "/files/Documents/"
      console.log("***ANDROID***")
    }else if (this.platform.is("ios")){
      this.pathDiviceIosAndroid = "/Documents/"
      console.log("***IOS***")
    }

    await this.storage.get('fontSize').then((val) => {
      if (val == null || val < 15) {
        this.fontSize = 20;
      } else {
        this.fontSize = val;
      }
    });

    await this.storage.get('update').then((val) => {
      if (val == null) {
        this.update = false;
      } else {
        this.update = true;
      }
    });

    await this.storage.get('nombrePlan').then((val) => {
      if (val !== null) {
        this.nombrePlan = val;
      }
      if (this.nombrePlan == 'bibleOneYear'){
        this.botonPlay = true
      }
    });

    
    
    this.mostrarTextoMetodo(this.libro, this.capitulo, this.versiculo, this.versiculoFinal);

    /*
    if (!this.versiculo) {             // Mostrar libro y capitulo
      this.mostrarTextoMetodo(this.libro, this.capitulo);
    } else if (!this.versiculoFinal) {  //libro capitulo y versiculo
      await this.buscarVersiculo(this.libro.toString(), this.capitulo.toString(), this.versiculo.toString());
      //{id_libro: "5", capitulo: "9", versiculo: "1", texto: "Oye,  Israel: Ha llegado el momento d, versiculo: "27"}
      this.textoJsonFinal = [{id_libro: this.libro, capitulo: this.capitulo, versiculo: this.versiculo, texto: this.textTemp}];
      this.actualizarLibroTitulo(this.libro);
      this.mostrarTexto = true;
      console.log("***********************");
      console.log(this.textoJsonFinal);
    } else {                           // libro capitulo y versiculo y versiculo final

    }*/

    await this.storage.set('playAuto', false);

    await this.storage.get('detalleDia').then((val) => {
      if (val !== null) {
        console.log(val);
        let tmp = true;
        for (let entry of val) {
          if (tmp) {
            this.capituloMenor = parseInt(entry.capitulo);
            tmp = false;
          }
          this.capituloMayor = parseInt(entry.capitulo);
        }
        this.detalleDia = val;
        this.cantDetalleDia = this.detalleDia.length -1; // el -1 es porque el array comienza en 0 y 
        // this.contParteDia = 0;                           // el .length cuanta a partir de 1
        console.log('capitulo ' + this.capitulo + ' versiculo ' + this.versiculo)
        if (this.capitulo && isNaN(this.versiculo)){
          console.log ('dentor de if capitulo')
          let cont = 0;
          for (let entry of this.detalleDia){
            if (entry.libro == this.libro && entry.capitulo == this.capitulo){
              this.contParteDia = cont; 
              console.log ('contParteDia '+ this.contParteDia)
            }
            cont++;
          }
        } else if (this.versiculo && isNaN(this.versiculoFinal)){
          console.log ('dentor de if versiculo')
          let cont = 0;
          for (let entry of this.detalleDia){
            if (entry.libro == this.libro && entry.capitulo == this.capitulo && entry.versiculo == this.versiculo){
              this.contParteDia = cont; 
            }
            cont++;
          }
        } else if (this.versiculoFinal){      // Estos if anidados son para saber cual detalle dia abrio 
          console.log ('dentor de if versiculo final')
          let cont = 0;
          for (let entry of this.detalleDia){
            if (entry.libro == this.libro && entry.capitulo == this.capitulo && entry.versiculo == this.versiculo && entry.versiculoFinal == this. versiculoFinal){
              this.contParteDia = cont; 
            }
            cont++;
          }
        } 


      }
    });

    await this.storage.get('diaPlan').then((val) => {
      if (val !== null) {
        this.dia = val;
      }
    });
    

    await this.storage.get(this.nombrePlan).then((val) => {
      if (val !== null) {
        this.planOfStora = val;
      } else {    // Si no existe el plan usa el inportado
        this.planOfStora = require(`../../assets/planes/${this.nombrePlan}.json`);
      }
      console.log('Desde el storage');
      console.log(this.planOfStora);
    });

    this.textoJsonFinal = await this.bibliaService.getTextoImport(this.libro, this.capitulo);
    //this.dataTemp = await this.textoJsonFinal 
    //console.log("***dataTemp");
    //console.log(this.dataTemp);
    
  } // fin ngOnInit

  async playAudio(){
    //this.ionContent.scrollToTop(300); //subir scroll al inicio
    
    let tiempo
  
    console.log("this.isPlaying playAudio " + this.isPlaying)
    if (this.isPlaying){
      //this.isPlaying = false;
      this.audio.pause();
      //await this.storage.set('playAuto', false);
      this.playPausa = "play"
      console.log("pause")
      this.marcarVersiculoAudioRemove("all")
    }else {
      //this.isPlaying = true;
      this.audio.src = this.audioMP3;
      this.audio.load();
      this.audio.currentTime = this.tiempoRecorrido - this.ultimoTiempo;
      //this.audio.currentTime = 244
      this.audio.play();
      //await this.storage.set('playAuto', false);
      this.playPausa = "pause"
        console.log("play")
    
      //this.audio.onplaying  =  async function() {
        //console.log("Event onplaying **")
     
        
      //};
      
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
    //this.router.navigate( ['/leer-plan/' + this.libro + "/" + this.capitulo + "/undefined/undefined"], {fragment: ""});    //Esto es para linpiar el fragment la url #
    //this.navCtrl.navigateForward([`/leer-plan/${this.libro}/${this.capitulo}/undefined/undefined`],{fragment: ""});
    //this.navCtrl.navigateForward(`/plan-detalle/${this.nombrePlan}`);


  }

  async botonAtras(){
    if (this.isPlaying){
      this.audio.pause();//Stop
      this.audio.currentTime = 0;
      await this.delay2(900);
      this.idPlay = 0
      this.tiempoRecorrido = 0  
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

  actualizarLibroTitulo(libro) {
    for (let entry of Libros) {
      if (libro.toString() === entry.id) {
        this.librot = entry.libro;
      }
    }
    // this.getcapitulos(libro);
  }

  async mostrarTextoMetodo(libro, capitulo, versiculo, versiculoFinal) {
    this.marcarVersiculoAudioRemove("all")
    this.citas = [];
    // this.storage.set('libro', libro);
    // this.storage.set('capitulo', capitulo);
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
    // update es referente a si se actualizo los arquivos JSON que tienen el texto.
    if (this.isPlaying){
      await this.delay2(900);
      this.idPlay = 0
      this.tiempoRecorrido = 0
      console.log("desde si *** audioReproductor")
      await this.audioReproductor()
    }else{
      this.idPlay = 0
      this.tiempoRecorrido = 0
      console.log("desde no *** audioReproductor")
      await this.audioReproductor()
    }

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

    if (!isNaN(versiculoFinal)){  //recopilar el rango de los versiclos 
      console.log('dentrodel NAN')
      this.textoJsonFinal = [];
      for (let cont = versiculo; cont <= parseInt(versiculoFinal); cont ++){
        console.log('cont '+ cont + ' versiculoFinal' + versiculoFinal);
        console.log(typeof cont + '   ' + typeof versiculoFinal);
        await this.buscarVersiculo(libro.toString(), capitulo.toString(), cont.toString());
        this.textoJsonFinal.push(
          { id_libro: libro, 
            capitulo: capitulo, 
            versiculo: cont, 
            texto: this.textTemp});
      }
    }else if (!isNaN(versiculo)) {  //recopilar libro capitulo y versiculo
      await this.buscarVersiculo(libro.toString(), capitulo.toString(), versiculo.toString());
      //{id_libro: "5", capitulo: "9", versiculo: "1", texto: "Oye,  Israel: Ha llegado el momento d, versiculo: "27"}
      this.textoJsonFinal = [{id_libro: libro, capitulo: capitulo, versiculo: versiculo, texto: this.textTemp}];
      console.log("***********************");
      console.log(this.textoJsonFinal);
    }
    this.mostrarTexto = true;
  }

  async audioReproductor(){
    if(this.nombrePlan =='bibleOneYear'){
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
      this.audio = new Audio();
      
      
      await this.storage.get('playAuto').then((val) => {
        if (val != null && val == true) {
          this.playAudio()
        }
        console.log("playAuto " + val);
      });

 
      this.audio.addEventListener("playing", async () => {
        await this.storage.set('playAuto', false);
        console.log("Event playing");
        this.isPlaying = true;
        let tiempo
        //console.log("Event onplaying");
        //console.log(this.tiempoAudio)
        if (this.tiempoAudio != null){
          this.tiempoRecorrido = 0; 
          for (const entry  of this.tiempoAudio){
            //console.log(entry)
            let versiculoAnterior = entry.versiculo - 1
            if (!this.isPlaying){
              this.idPlay = parseInt(entry.id) - 1 ;
              //console.log("idPlay")
              //console.log(this.idPlay)            
              break;
            }
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
                //this.router.navigate( ["/leer-plan/" + this.libro + "/" + this.capitulo + "/undefined/undefined"], {fragment: "l"+entry.versiculo});
                //this.navCtrl.navigateForward([`/leer-plan/${this.libro}/${this.capitulo}/undefined/undefined`],{fragment: "l"+entry.versiculo});
              }
              //Siguiente linea es para hacer efecto el route frament [recordar debe existir el id en el html]
              this.sub = this.activatedRoute.fragment.pipe(filter(f => !!f)).subscribe(f => document.getElementById(f).scrollIntoView());

              if (tiempo > 1){
                for (let _i = 0; _i < tiempo*2; _i++) { //ms*2  y time 500 es para solucionar pause play rapido
                  if (!this.isPlaying){
                    break
                  }
                  await new Promise( resolve => setTimeout(resolve, 500) );
                }
                await new Promise( resolve => setTimeout(resolve, tiempoRestante) );
              }else {
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
        this.isPlaying = false;
        this.playPausa = "play"
        this.marcarVersiculoAudioRemove("all")
        /*

        await this.storage.set('playAuto', false);
        this.playPausa = "play"
        console.log("pause")
        this.marcarVersiculoAudioRemove("all")
        */
      });
      
      this.audio.addEventListener("ended", async () => {
        await this.storage.set('playAuto', true);
        console.log("Event finalizo el audio reproducción");
        this.nextboton()
      });

      /*
      Provar mejor los eventos
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
       */
    }
  }
  
  delay2(ms: number) {
    console.log("delay")
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  previousboton2() {
    this.ionContent.scrollToTop(300);
    if (this.capitulo > this.capituloMenor) {
      this.capitulo--;
      this.mostrarTextoMetodo(this.libro, this.capitulo, this.versiculo, this.versiculoFinal);
    }
  }

  async previousboton() {
    this.ionContent.scrollToTop(300);
    let detalleMarcar = this.detalleDia[this.contParteDia];
    let detalleMostrar = this.detalleDia[this.contParteDia - 1];  // Para plan q año this.detalleDia
    console.log(detalleMostrar);
    if (this.contParteDia >= 1 && this.contParteDia <= this.cantDetalleDia) {  
      this.contParteDia--;
      this.mostrarTextoMetodo(detalleMostrar.libro, detalleMostrar.capitulo, detalleMostrar.versiculo, detalleMostrar.versiculoFinal);
      this.detalleTemp = detalleMarcar;
    }
      //this.navCtrl.navigateForward(`/plan-detalle/${this.nombrePlan}`);
    
    //this.router.navigate( ["/leer-plan" + this.libro + "/" + this.capitulo + "/undefined/undefined"], {fragment: ""});
    //this.navCtrl.navigateForward([`/leer-plan/${this.libro}/${this.capitulo}/undefined/undefined`],{fragment: ""});
    this.marcarVersiculoAudioRemove("all")
    
    if (this.isPlaying){
      this.audio.pause();//Stop
      this.audio.currentTime = 0;
      await this.delay2(900);
      this.idPlay = 0
      this.tiempoRecorrido = 0
      
    }else{
      this.idPlay = 0
      this.tiempoRecorrido = 0
    }
  }

  async nextboton() {
    this.ionContent.scrollToTop(300);
    this.marcarVersiculoAudioRemove("all")
    console.log("Desde Next this.isPlaying " + this.isPlaying )
    if (this.isPlaying ){
      console.log("Desde if next ")
      this.audio.pause() //Stop
      this.audio.currentTime = 0
      this.idPlay = 0
      await this.delay2(1500);
    }else{
      console.log("Desde else next ")
      await this.delay2(1500);
      this.audio.currentTime = 0
      this.idPlay = 0
    }
    let detalleMarcar = this.detalleDia[this.contParteDia];
    let detalleMostrar = this.detalleDia[this.contParteDia + 1];  // Para plan q año this.detalleDia[this.contParteDia]; 
    console.log ("contadorParteDia " + this.contParteDia + " cantDetalleDia "+ this.cantDetalleDia);
    console.log('Detalle mostrar');
    console.log(detalleMostrar);
    this.detalleTemp = detalleMarcar;
    if (this.contParteDia < this.cantDetalleDia) {  
      console.log(this.contParteDia);
      console.log(this.cantDetalleDia);
      this.statusCheckbox(this.dia, this.libro.toString(), this.capitulo.toString(), detalleMarcar.versiculo, detalleMarcar.versiculoFinal);
      this.contParteDia++;
      console.log(detalleMostrar);
      this.mostrarTextoMetodo(detalleMostrar.libro, detalleMostrar.capitulo, detalleMostrar.versiculo, detalleMostrar.versiculoFinal);

    } else {
      if (this.detalleTemp.hasOwnProperty('versiculoFinal') ){
        this.statusCheckbox(this.dia, this.libro.toString(), this.capitulo.toString(),this.detalleTemp.versiculo, this.detalleTemp.versiculoFinal);
      }else if (this.detalleTemp.hasOwnProperty('versiculo')){
        this.statusCheckbox(this.dia, this.libro.toString(), this.capitulo.toString(),this.detalleTemp.versiculo, null);
      }else {
        this.statusCheckbox(this.dia, this.libro.toString(), this.capitulo.toString(),null, null);
      }
      this.navCtrl.navigateForward(`/plan-detalle/${this.nombrePlan}`);
    }
    
    //this.router.navigate( ["/leer-plan/" + this.libro + "/" + this.capitulo + "/undefined/undefined"], {fragment: ""});
    //this.navCtrl.navigateForward([`/leer-plan/${this.libro}/${this.capitulo}/undefined/undefined`],{fragment: ""});
    
 
  }

  statusCheckbox(dia, libro, capitulo, versiculo, versiculoFinal) {                 // CONTROLA la marca de capitulos leidos
    console.log("dia " + dia + "libro "+libro +" capitulo "+ capitulo + " Versiculo " + versiculo + "Versiculo final "+ versiculoFinal);
    let tempoDia:Array<any> = new Array();
    let tempoDetalle:Array<any> = new Array();
    let statusDia:Array<any> = new Array();             // Se creo para identifical algun check desmarcado
    let statusDiaBoleano = true;
    for (let dias of this.planOfStora) {
      if (dias.dia === dia) {
        for (let detalle of dias.detalles) {
          if (detalle.versiculoFinal === versiculoFinal && detalle.versiculo === versiculo && detalle.libro === libro && detalle.capitulo === capitulo) {
            tempoDetalle.push({libro: detalle.libro, capitulo: detalle.capitulo, status: true,versiculo: detalle.versiculo, versiculoFinal: detalle.versiculoFinal});
            statusDia.push(true);
          } else if (detalle.versiculo === versiculo && detalle.libro === libro && detalle.capitulo === capitulo) {
            tempoDetalle.push({libro: detalle.libro, capitulo: detalle.capitulo, status: true,versiculo: detalle.versiculo});
            statusDia.push(true);
          } else if (detalle.libro === libro && detalle.capitulo === capitulo) {
            tempoDetalle.push({libro: detalle.libro, capitulo: detalle.capitulo, status: true});
            statusDia.push(true);
            // tempoDetalle.push({libro: detalle.libro, capitulo: detalle.capitulo, status: true});
          } else {
            tempoDetalle.push(detalle);
            if (detalle.status === true) {
              statusDia.push(true);
            } else {
              statusDia.push(false);
            }
          }
        }
        for (let status of statusDia) {
          if (!status) {
            statusDiaBoleano = false;
          }
        }
        if (statusDiaBoleano) {
          tempoDia.push({ dia: dias.dia, statusDia: true, libro: dias.libro, detalles: tempoDetalle});
        } else {
          tempoDia.push({ dia: dias.dia, statusDia: false, libro: dias.libro, detalles: tempoDetalle});
        }
      } else {
        //  this.primerP.push({ id: entry.id, capitulos: entry.capitulos, libro: this.getCleanedString(entry.libro), estado : 'listo'});
        tempoDia.push(dias);
      }
    }
    this.planOfStora = tempoDia;
    console.log (this.planOfStora);
    this.storage.set(this.nombrePlan, this.planOfStora);

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
      // console.log("mapCita");
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
      // console.log("mapText");
      // console.log(this.mapText);
      // this.sanitizer.bypassSecurityTrustHtml(this.versiculoFinal);
    } else { 
      this.textoJsonFinal.push(text);
    }
  }
  // console.log(this.textoJsonFinal);
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
                  this.mostrarTextoMetodo(idLibro, capituloC,null,null);
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

seleccionarVersiculo(texto, idLibro, capitulo, versiculo) {
  document.body.classList.toggle("readVersiculol" + versiculo); 
  this.buscarVersiculo(idLibro, capitulo, versiculo);
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
    if(this.fontSize < 28){
      this.fontSize = this.fontSize + 1;
      this.storage.set("fontSize", this.fontSize);
    }
  }
  disminuirSize() {
    if (this.fontSize >16){
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

} // fin class
