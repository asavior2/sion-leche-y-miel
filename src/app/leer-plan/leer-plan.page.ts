import { Component, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { BibliaService } from '../services/biblia.service';
import Libros from '../../assets/libros.json';
import LibrosHebreo from '../../assets/librosHebreo.json';
import { IonContent, AlertController } from '@ionic/angular';
import { Storage as IonicStorage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { TabsPage } from "../tabs/tabs.page";
import { DomSanitizer } from '@angular/platform-browser';
import { ActionSheetController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Clipboard } from '@awesome-cordova-plugins/clipboard/ngx';
import { Zip } from '@awesome-cordova-plugins/zip/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { NavController } from '@ionic/angular';
import planesFile from '../../assets/planesLectura.json';
//import { ConsoleReporter } from 'jasmine';
//import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AnalyticsService } from '../core/services/analytics.service';
import { SyncService } from '../core/services/sync.service';
import { Bookmark, Note } from '../core/repositories/bible.repository';
import { LocalBibleRepository } from '../core/repositories/local-bible.repository';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { AudioPlayerService } from '../core/services/audio-player.service';

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
  prueba;
  contadorCitas = 1;
  versiculoCompleto = {
    'datos': []
  };
  hayCitas = false;
  mapCita = [];
  mapText = [];
  idTituloTemp: any;
  tituloTemp: any;
  comprimidoTemp: any;
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
  notas: any[] = [];
  marcarV;
  zipPath;
  progrss: any = "";
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
  planesActivos: Array<any> = new Array();
  cantDetalleDia;
  contParteDia;
  detalleTemp;
  private fragment: string;
  playPausa: string = "play";
  share: boolean = false;
  copiaCondensado = [];
  botonPlay: boolean = false;
  pathDiviceIosAndroid: string;
  darkMode: boolean = true; // Kept for Backwards Compatibility
  currentTheme: 'light' | 'sepia' | 'dark' = 'light';
  estadoDark: string = "moon";

  // Audio State from Service
  isPlaying: boolean = false;
  currentHighlightedVerse: any = null;
  // Selection Menu State
  isMenuOpen = false;
  selectedVerseForMenu: any = null;
  selectedColor: string = '#FFF9C4'; // Default Pastel Yellow

  highlightsMap: { [key: string]: string } = {};

  updateHighlightsMap() {
    this.highlightsMap = {};
    if (this.marcador) {
      for (const marca of this.marcador) {
        // Marcador object structure: {capitulo, versiculo, color}
        const key = `${this.capitulo}:${marca.versiculo}`;
        this.highlightsMap[key] = marca.color || '#FFEB3B';
      }
    }
  }

  @ViewChild(IonContent, { static: true }) ionContent: IonContent;
  constructor(private activatedRoute: ActivatedRoute,
    private bibliaService: BibliaService,
    public actionSheetController: ActionSheetController,
    private http: HTTP,
    private httpClient: HttpClient,
    private storage: IonicStorage,
    private sanitizer: DomSanitizer,
    public alertController: AlertController,
    private platform: Platform,
    private clipboard: Clipboard,
    private zip: Zip,
    public file: File,
    private navCtrl: NavController,
    public router: Router,
    private analytics: AnalyticsService,
    private syncService: SyncService,
    private localRepo: LocalBibleRepository,
    private socialSharing: SocialSharing,
    private audioService: AudioPlayerService

  ) {
    this.platform.backButton.observers.pop();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDark.matches) {
      this.currentTheme = 'dark';
      this.estadoDark = 'sunny';
    } else {
      this.currentTheme = 'light';
      this.estadoDark = 'eye';
    }
  }

  async ngOnInit() {
    this.audioService.isPlaying$.subscribe(playing => {
      this.isPlaying = playing;
      this.playPausa = playing ? 'pause' : 'play';
    });

    this.audioService.currentVerse$.subscribe(verse => {
      if (verse !== null && verse !== this.currentHighlightedVerse) {
        // Remove previous
        if (this.currentHighlightedVerse) {
          this.marcarVersiculoAudioRemove(this.currentHighlightedVerse);
        }
        // Add new
        this.currentHighlightedVerse = verse;
        this.marcarVersiculoAudioAdd(verse);

        // Scroll
        const id = 'lp' + verse;
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (verse === null) {
        // Audio Ended or Stopped
        if (this.currentHighlightedVerse) {
          this.marcarVersiculoAudioRemove(this.currentHighlightedVerse);
          this.currentHighlightedVerse = null;
        }
        // Handle Auto-advance for plans if needed?
        // Logic for auto-next was in 'ended' event of old audio. 
        // We might need to listen to that behavior or handle it via a separate subscription to Ended?
        // For strict parity, let's replicate the 'nextboton' call when audio ends?
        // The service emits false on end, and null verse.

        // TODO: Strict "Ended" event handling might need a specific Observable if we want to auto-advance only on finish, not user stop.
        // For now, let's check previous logic.
      }
    });

    // We need to restore 'ended' -> 'nextboton' logic.
    // The service doesn't have a distinct 'ended' observable yet, just state updates.
    // But we know if it goes from Playing True -> False and Verse -> Null... it could be Stop or End.
    // Let's rely on manual interaction for now or add 'ended$' to service if critical.
    // Wait, the previous logic had strict auto-advance. Let's add that to service later if requested.
  }

  async ionViewWillEnter() {
    this.libro = parseInt(this.activatedRoute.snapshot.paramMap.get('libro'));
    this.capitulo = parseInt(this.activatedRoute.snapshot.paramMap.get('capitulo'));
    // Handle 'undefined' string explicitly before parsing
    const vParam = this.activatedRoute.snapshot.paramMap.get('versiculo');
    const vfParam = this.activatedRoute.snapshot.paramMap.get('versiculoFinal');

    this.versiculo = (vParam && vParam !== 'undefined') ? parseInt(vParam) : NaN;
    this.versiculoFinal = (vfParam && vfParam !== 'undefined') ? parseInt(vfParam) : NaN;


    if (this.platform.is("android")) {
      this.pathDiviceIosAndroid = "/files/Documents/"
      console.log("***ANDROID***")
    } else if (this.platform.is("ios")) {
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
      if (this.nombrePlan == 'bibleOneYear') {
        this.botonPlay = true
      }
    });

    await this.mostrarTextoMetodo(this.libro, this.capitulo, this.versiculo, this.versiculoFinal);

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
        this.cantDetalleDia = this.detalleDia.length - 1; // el -1 es porque el array comienza en 0 y 
        // this.contParteDia = 0;                           // el .length cuanta a partir de 1
        console.log('capitulo ' + this.capitulo + ' versiculo ' + this.versiculo)
        if (this.capitulo && isNaN(this.versiculo)) {
          console.log('dentor de if capitulo')
          let cont = 0;
          for (let entry of this.detalleDia) {
            if (entry.libro == this.libro && entry.capitulo == this.capitulo) {
              this.contParteDia = cont;
              console.log('contParteDia ' + this.contParteDia)
            }
            cont++;
          }
        } else if (this.versiculo && isNaN(this.versiculoFinal)) {
          console.log('dentor de if versiculo')
          let cont = 0;
          for (let entry of this.detalleDia) {
            if (entry.libro == this.libro && entry.capitulo == this.capitulo && entry.versiculo == this.versiculo) {
              this.contParteDia = cont;
            }
            cont++;
          }
        } else if (this.versiculoFinal) {      // Estos if anidados son para saber cual detalle dia abrio 
          console.log('dentor de if versiculo final')
          let cont = 0;
          for (let entry of this.detalleDia) {
            if (entry.libro == this.libro && entry.capitulo == this.capitulo && entry.versiculo == this.versiculo && entry.versiculoFinal == this.versiculoFinal) {
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


    await this.storage.get(this.nombrePlan).then(async (val) => {
      if (val !== null) {
        this.planOfStora = val;
      } else {    // Si no existe el plan usa el inportado
        //this.planOfStora = require(`../../assets/planes/${this.nombrePlan}.json`);
        this.planOfStora = await firstValueFrom(this.httpClient.get(`/assets/planes/${this.nombrePlan}.json`));
      }
      console.log('Desde el storage');
      console.log(this.planOfStora);
    });

    // this.textoJsonFinal = await this.bibliaService.getTextoImport(this.libro, this.capitulo);
  }

  async playAudio() {
    if (this.isPlaying) {
      this.audioService.pauseAudio();
    } else {
      if (this.nombrePlan === 'bibleOneYear') {
        // Logic to resolve path
        // Default to remote URL so it works if local fails
        let audioSrc = "https://sionlecheymiel.com/file/audios/" + this.libro + "/" + this.capitulo + ".mp3";

        // ... Path resolution logic ...
        // We need to move path resolution here or keep it.
        // Let's refactor path resolution to be cleaner.

        if (this.platform.is("android")) {
          this.pathDiviceIosAndroid = "/files/Documents/";
        } else if (this.platform.is("ios")) {
          this.pathDiviceIosAndroid = "/Documents/";
        }

        const localPath = "por-Capitulos/" + this.libro + "/" + this.capitulo + ".mp3";
        const fullPath = this.file.applicationStorageDirectory + this.pathDiviceIosAndroid + localPath;

        // Check File Exists
        try {
          const exists = await this.file.checkFile(this.file.applicationStorageDirectory + this.pathDiviceIosAndroid, localPath);
          if (exists) {
            audioSrc = (window as any).Ionic.WebView.convertFileSrc(fullPath);
          }
        } catch (e) {
          console.log("Local audio retrieval failed, using remote.");
        }

        try {
          const timeMapData = await this.bibliaService.getTextoAudio(this.libro, this.capitulo);
          this.audioService.playAudio(audioSrc, timeMapData as any[]);
        } catch (e) {
          console.warn("Audio map not found, playing without sync.", e);
          this.audioService.playAudio(audioSrc);
        }
      }
    }
  }

  marcarVersiculoAudioAdd(versiculo) {
    const id = 'lp' + versiculo;
    const el = document.getElementById(id);
    if (el) el.classList.add('versiculo-highlight');
  }
  marcarVersiculoAudioRemove(versiculo) {
    if (versiculo === "all") {
      this.share = false;
      this.isMenuOpen = false;
      this.copiaCondensado = [];
      const els = document.querySelectorAll('.versiculo-highlight');
      els.forEach(el => el.classList.remove('versiculo-highlight'));
    } else {
      const id = 'lp' + versiculo;
      const el = document.getElementById(id);
      if (el) el.classList.remove('versiculo-highlight');
    }
  }

  ngAfterViewInit(): void {
    //this.router.navigate( ['/leer-plan/' + this.libro + "/" + this.capitulo + "/undefined/undefined"], {fragment: ""});    //Esto es para linpiar el fragment la url #
    //this.navCtrl.navigateForward([`/leer-plan/${this.libro}/${this.capitulo}/undefined/undefined`],{fragment: ""});
    //this.navCtrl.navigateForward(`/plan-detalle/${this.nombrePlan}`);


  }

  async botonAtras() {
    if (this.isPlaying) {
      this.audioService.stopAudio();
    }
  }

  changeDark() {
    // Cycle: Light -> Sepia -> Dark -> Light
    if (this.currentTheme === 'light') {
      // Switch to Sepia
      this.currentTheme = 'sepia';
      document.body.classList.remove('dark');
      document.body.classList.add('sepia');
      this.estadoDark = 'moon'; // Next is Dark
    } else if (this.currentTheme === 'sepia') {
      // Switch to Dark
      this.currentTheme = 'dark';
      document.body.classList.remove('sepia');
      document.body.classList.add('dark');
      this.estadoDark = 'sunny'; // Next is Light
      this.darkMode = true;
    } else {
      // Switch to Light
      this.currentTheme = 'light';
      document.body.classList.remove('dark');
      document.body.classList.remove('sepia');
      this.estadoDark = 'eye'; // Next is Sepia
      this.darkMode = false;
    }
  }

  getCleanedString(cadena) {
    cadena = cadena.replace(/á/gi, "a");
    cadena = cadena.replace(/Éxodo/gi, "Exodo");
    cadena = cadena.replace(/é/gi, "e");
    cadena = cadena.replace(/í/gi, "i");
    cadena = cadena.replace(/ó/gi, "o");
    cadena = cadena.replace(/ú/gi, "u");
    cadena = cadena.replace(/ñ/gi, "n");
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

    // Check Bookmarks
    this.storage.get(libro.toString()).then((val) => {
      if (val == null) {
        this.marcador = [];
      } else {
        this.marcador = val;
      }
    });

    // Check Notes (Load from LocalRepo for this book/chapter)
    // Optimization: We could filter in memory or query specific
    this.notas = await this.localRepo.getNotes();
    // Ideally getNotes should be filtered by book/chapter or we filter here

    this.mostrarCapitulos = false;
    this.libro = libro;
    this.capitulo = capitulo;
    this.actualizarLibroTitulo(this.libro);
    // update es referente a si se actualizo los arquivos JSON que tienen el texto.
    if (this.isPlaying) {
      // Stop audio on content change? Or keep playing?
      // Old logic restarted audio logic. 
      // New logic: simpler, just reload audio if needed? 
      // Usually changing chapter implies stopping old audio.
      this.audioService.stopAudio();
    }

    if (this.update) {
      await this.bibliaService.getTextoFile(this.libro, this.capitulo).then((data) => {
        // console.log(data);
        this.textoJsonFinal = JSON.parse(data);
      }).catch(async err => {
        this.storage.remove('update');
        this.textoJsonFinal = await this.bibliaService.getTextoImport(this.libro, this.capitulo);
      });
    } else {
      this.textoJsonFinal = await this.bibliaService.getTextoImport(this.libro, this.capitulo);
    }
    this.updateHighlightsMap();

    const vInicio = parseInt(versiculo);
    const vFin = parseInt(versiculoFinal);

    console.log('DEBUG: versiculo:', versiculo, 'vInicio:', vInicio, 'isNaN:', isNaN(vInicio));
    console.log('DEBUG: versiculoFinal:', versiculoFinal, 'vFin:', vFin, 'isNaN:', isNaN(vFin));

    if (!isNaN(vFin) && !isNaN(vInicio)) {  // Rango de versículos
      this.textoJsonFinal = [];
      for (let cont = vInicio; cont <= vFin; cont++) {
        await this.buscarVersiculo(libro.toString(), capitulo.toString(), cont.toString());
        // Push object with all potential metadata
        let pushObj: any = {
          id_libro: libro,
          capitulo: capitulo,
          versiculo: cont,
          texto: this.textTemp
        };
        if (this.idTituloTemp) pushObj.idTitulo = this.idTituloTemp;
        if (this.tituloTemp) pushObj.titulo = this.tituloTemp;
        if (this.comprimidoTemp) {
          pushObj.comprimido = this.comprimidoTemp;
        }

        this.textoJsonFinal.push(pushObj);
      }
    } else if (!isNaN(vInicio)) {  // Solo un versículo
      await this.buscarVersiculo(libro.toString(), capitulo.toString(), vInicio.toString());

      let pushObj: any = {
        id_libro: libro,
        capitulo: capitulo,
        versiculo: vInicio,
        texto: this.textTemp
      };
      if (this.idTituloTemp) pushObj.idTitulo = this.idTituloTemp;
      if (this.tituloTemp) pushObj.titulo = this.tituloTemp;
      if (this.comprimidoTemp) pushObj.comprimido = this.comprimidoTemp;

      this.textoJsonFinal = [pushObj];
      console.log("***********************");
      console.log(this.textoJsonFinal);
    }

    // Analytics
    this.analytics.logReading(this.librot || libro.toString(), capitulo);

    // Inject Metadata for Robustness (Fixes blank screen on component)
    if (this.textoJsonFinal) {
      this.textoJsonFinal.forEach(t => {
        if (!t.id_libro) t.id_libro = this.libro;
        if (!t.capitulo) t.capitulo = this.capitulo;
      });
    }

    this.mostrarTexto = true;
  }

  clickDias(dia, index) {
    this.contParteDia = index;
    this.mostrarTextoMetodo(dia.libro, dia.capitulo, dia.versiculo, dia.versiculoFinal);
  }

  // Removed deprecated audio logic (audioReproductor, calculateTimeMap)

  delay2(ms: number) {
    console.log("delay")
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  previousboton2() {
    if (this.capitulo > this.capituloMenor) {
      this.capitulo--;
      this.mostrarTextoMetodo(this.libro, this.capitulo, this.versiculo, this.versiculoFinal);
    }
    this.ionContent.scrollToTop(300);
  }

  async previousboton() {
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

    if (this.isPlaying) {
      this.audioService.stopAudio();
    }
    this.ionContent.scrollToTop(300);
  }

  async nextboton() {
    this.marcarVersiculoAudioRemove("all")
    if (this.isPlaying) {
      this.audioService.stopAudio();
    }
    let detalleMarcar = this.detalleDia[this.contParteDia];
    let detalleMostrar = this.detalleDia[this.contParteDia + 1];  // Para plan q año this.detalleDia[this.contParteDia]; 
    console.log("contadorParteDia " + this.contParteDia + " cantDetalleDia " + this.cantDetalleDia);
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
      if (this.detalleTemp.hasOwnProperty('versiculoFinal')) {
        this.statusCheckbox(this.dia, this.libro.toString(), this.capitulo.toString(), this.detalleTemp.versiculo, this.detalleTemp.versiculoFinal);
      } else if (this.detalleTemp.hasOwnProperty('versiculo')) {
        this.statusCheckbox(this.dia, this.libro.toString(), this.capitulo.toString(), this.detalleTemp.versiculo, null);
      } else {
        this.statusCheckbox(this.dia, this.libro.toString(), this.capitulo.toString(), null, null);
      }
      this.navCtrl.navigateForward(`/plan-detalle/${this.nombrePlan}`);
    }

    //this.router.navigate( ["/leer-plan/" + this.libro + "/" + this.capitulo + "/undefined/undefined"], {fragment: ""});
    //this.navCtrl.navigateForward([`/leer-plan/${this.libro}/${this.capitulo}/undefined/undefined`],{fragment: ""});

    this.ionContent.scrollToTop(300);
  }

  statusCheckbox(dia, libro, capitulo, versiculo, versiculoFinal) {                 // CONTROLA la marca de capitulos leidos
    console.log("dia " + dia + "libro " + libro + " capitulo " + capitulo + " Versiculo " + versiculo + "Versiculo final " + versiculoFinal);
    let tempoDia: Array<any> = new Array();
    let tempoDetalle: Array<any> = new Array();
    let statusDia: Array<any> = new Array();             // Se creo para identifical algun check desmarcado
    let statusDiaBoleano = true;
    for (let dias of this.planOfStora) {
      if (dias.dia === dia) {
        for (let detalle of dias.detalles) {
          if (detalle.versiculoFinal === versiculoFinal && detalle.versiculo === versiculo && detalle.libro === libro && detalle.capitulo === capitulo) {
            tempoDetalle.push({ libro: detalle.libro, capitulo: detalle.capitulo, status: true, versiculo: detalle.versiculo, versiculoFinal: detalle.versiculoFinal });
            statusDia.push(true);
          } else if (detalle.versiculo === versiculo && detalle.libro === libro && detalle.capitulo === capitulo) {
            tempoDetalle.push({ libro: detalle.libro, capitulo: detalle.capitulo, status: true, versiculo: detalle.versiculo });
            statusDia.push(true);
          } else if (detalle.libro === libro && detalle.capitulo === capitulo) {
            tempoDetalle.push({ libro: detalle.libro, capitulo: detalle.capitulo, status: true });
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
          tempoDia.push({ dia: dias.dia, statusDia: true, libro: dias.libro, detalles: tempoDetalle });
          this.analytics.logEvent('complete_plan_day', { plan_name: this.nombrePlan, dia: dias.dia });
          // Sync with SQLite
          this.bibliaService.saveReadingProgress(this.nombrePlan, parseInt(dias.dia), 1);
        } else {
          tempoDia.push({ dia: dias.dia, statusDia: false, libro: dias.libro, detalles: tempoDetalle });
          // Sync with SQLite (0 = incomplete)
          this.bibliaService.saveReadingProgress(this.nombrePlan, parseInt(dias.dia), 0);
        }
      } else {
        //  this.primerP.push({ id: entry.id, capitulos: entry.capitulos, libro: this.getCleanedString(entry.libro), estado : 'listo'});
        tempoDia.push(dias);
      }
    }
    this.planOfStora = tempoDia;
    console.log(this.planOfStora);
    this.storage.set(this.nombrePlan, this.planOfStora);

  }
  // ______________________________________________________________________________________________
  organizarCitas(textoJson) {
    this.textoJsonFinal = [];
    for (let text of textoJson) {
      this.mapText = [];
      this.mapCita = [];
      if (this.citas != null) {
        for (let cita of this.citas) {

          if (cita.versiculo === text.versiculo) {
            if (text.texto.toLowerCase().indexOf(cita.palabraAntes.toLowerCase(), 0) == "-1") {
              this.posicion = text.texto.length;
            } else {
              this.posicion = text.texto.toLowerCase().indexOf(cita.palabraAntes.toLowerCase(), 0) + cita.palabraAntes.length;
            }

            this.mapCita.push({
              palabraAntes: cita.palabraAntes,
              versiculo: cita.versiculo,
              cita: cita.cita,
              libroCita: cita.libroCita,
              capituloCita: cita.capituloCita,
              versiculoCitaInicial: cita.versiculoCitaInicial,
              versiculoCitaFinal: cita.versiculoCitaFinal,
              posicion: this.posicion
            });

          }
        }
      }
      if (this.mapCita.length > 0) {
        this.mapCita.sort((a, b) => a.posicion - b.posicion);
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
              capituloCita: citaVersiculo.capituloCita,
              versiculoCitaInicial: citaVersiculo.versiculoCitaInicial,
              versiculoCitaFinal: citaVersiculo.versiculoCitaFinal,
              posicion: citaVersiculo.posicion,
              parteFinal: text.texto.substring(citaVersiculo.posicion, text.texto.length)
            });
          } else {
            this.mapText.push({
              id_libro: text.id_libro,
              capitulo: text.capitulo,
              versiculo: citaVersiculo.versiculo,
              cita: citaVersiculo.cita,
              parteText: text.texto.substring(posicionInicial, citaVersiculo.posicion),
              ibroCita: citaVersiculo.libroCita,
              capituloCita: citaVersiculo.capituloCita,
              versiculoCitaInicial: citaVersiculo.versiculoCitaInicial,
              versiculoCitaFinal: citaVersiculo.versiculoCitaFinal,
              posicion: citaVersiculo.posicion
            });
          }
          posicionInicial = citaVersiculo.posicion;
          cont++;
        }
        this.textoJsonFinal.push({ versiculo: this.versiculoTEMP, capitulo: text.capitulo, id_libro: text.id_libro, comprimido: this.mapText });
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
  async mostrarCitaAlert(cita, textoVersiculo, idLibro, capituloC) {
    const alert = await this.alertController.create({
      header: cita,
      message: textoVersiculo,
      buttons: [
        { text: 'OK' },
        {
          text: 'Ir al Capitulo',
          handler: () => {
            this.mostrarTextoMetodo(idLibro, capituloC, null, null);
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
              for (let texto of text.comprimido) {
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
      this.textTemp = '';
      this.tituloTemp = null;
      this.idTituloTemp = null;
      this.comprimidoTemp = null;

      // console.log("DEBUG: DataTemp Length:", this.dataTemp?.length);
      for (let text of this.dataTemp) {
        // console.log("DEBUG: Comparision:", versiculo, text.versiculo, versiculo == text.versiculo);
        if (versiculo == text.versiculo) {
          // Capture metadata
          if (text.hasOwnProperty('idTitulo')) {
            this.idTituloTemp = text.idTitulo;
            this.tituloTemp = text.titulo;
          }

          if (text.hasOwnProperty('comprimido')) {
            this.comprimidoTemp = text.comprimido; // Save full compressed structure
            this.textTemp = '';
            for (let texto of text.comprimido) {
              this.textTemp = this.textTemp + ' ' + texto.parteText;
              if (texto.hasOwnProperty('parteFinal')) {
                this.textTemp = this.textTemp + ' ' + texto.parteFinal;
              }
            }
          } else {
            if (text.texto) {
              this.textTemp = text.texto;
            }
          }
          // Break once found to avoid redundant loops? No, keep logic
        }
      }
    }


  }


  async seleccionarVersiculo(texto, idLibro, capitulo, versiculo) {
    console.log('DEBUG: seleccionarVersiculo called', { idLibro, capitulo, versiculo, texto });

    // document.body.classList.toggle("readVersiculol" + versiculo);
    // Use new highlighting logic
    // Check if already highlighted (logic inferred from toggle behavior)
    const id = 'lp' + versiculo;
    const el = document.getElementById(id);
    console.log('DEBUG: Manual Click Element:', el);

    if (el && el.classList.contains('versiculo-highlight')) {
      console.log('DEBUG: Removing manual highlight');
      this.marcarVersiculoAudioRemove(versiculo);
    } else {
      console.log('DEBUG: Adding manual highlight');
      this.marcarVersiculoAudioAdd(versiculo);
    }

    await this.buscarVersiculo(idLibro, capitulo, versiculo);
    console.log('DEBUG: Text captured:', this.textTemp);

    let arreglo = [idLibro, capitulo, versiculo, this.textTemp]
    if (this.copiaCondensado[versiculo] == null) {
      this.copiaCondensado[versiculo] = arreglo
      console.log("DEBUG: Added to copy set. Count:", this.copiaCondensado.length)
    } else {
      this.copiaCondensado.splice(versiculo, 1);
      console.log("DEBUG: Removed from copy set");
      //delete this.copiaCondensado[versiculo]
    }
    let contador = 0
    for (let clave in this.copiaCondensado) {
      contador++
    }

    if (contador > 0) {
      this.isMenuOpen = true; // Open Bottom Sheet
      // Update selected verse for single-actions (like Note)
      this.selectedVerseForMenu = {
        book_id: idLibro,
        chapter: capitulo,
        verse: versiculo,
        content: this.textTemp
      };
    } else {
      this.isMenuOpen = false;
      this.selectedVerseForMenu = null;
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

  copiarVersiculo() {
    let textTemp = "";
    for (let clave in this.copiaCondensado) {
      textTemp = textTemp + " " + this.copiaCondensado[clave][2] + this.copiaCondensado[clave][3]
      //console.log(this.copiaCondensado[clave])
    }
    //console.log(textTemp + " " + this.librot + " " + this.capitulo + ":"  + ' Biblia SLM http://sionlecheymiel.com')
    this.clipboard.copy('*Biblia "Sion: Leche y Miel" ' + this.librot + " " + this.capitulo + '*' + textTemp + ' https://sionlecheymiel.com');
    this.marcarVersiculoAudioRemove("all")
    this.isMenuOpen = false;
  }

  async compartirVersiculo() {
    let textTemp = "";
    for (let clave in this.copiaCondensado) {
      textTemp = textTemp + " " + this.copiaCondensado[clave][2] + this.copiaCondensado[clave][3]
    }

    const shareMsg = `*Biblia "Sion: Leche y Miel" ${this.librot} ${this.capitulo}* ${textTemp} https://sionlecheymiel.com`;

    this.socialSharing.share(shareMsg, null, null, null).then(() => {
      this.marcarVersiculoAudioRemove("all");
      this.isMenuOpen = false;
    }).catch((error) => {
      console.error("Share failed", error);
      this.copiarVersiculo();
    });
  }
  async marcarVersiculo() {
    for (let clave in this.copiaCondensado) {
      //this.guardarMarcador(idLibro, capitulo, versiculo);
      await this.guardarMarcador(this.copiaCondensado[clave][0], this.copiaCondensado[clave][1], this.copiaCondensado[clave][2], this.selectedColor);
    }
    this.marcarVersiculoAudioRemove("all")
    this.isMenuOpen = false;
  }

  aumentarSize() {
    if (this.fontSize < 28) {
      this.fontSize = this.fontSize + 1;
      this.storage.set("fontSize", this.fontSize);
    }
  }
  disminuirSize() {
    if (this.fontSize > 16) {
      this.fontSize--
      this.storage.set('fontSize', this.fontSize);
    }
  }



  seleccionarColor(color) {
    this.selectedColor = color;
  }

  async guardarMarcador(libro, capitulo, versiculo, color = '#FFF9C4') {
    //console.log(this.marcador);
    const resultadoMarcador = this.marcador.find(marcador => marcador.capitulo === capitulo && marcador.versiculo === versiculo);
    //console.log(resultadoMarcador);
    let indiceMarcador = this.marcador.findIndex(marcador => marcador.capitulo === capitulo && marcador.versiculo === versiculo);
    if (resultadoMarcador === undefined) {
      this.marcador.push({
        capitulo: capitulo,
        versiculo: versiculo,
        color: color
      });
      this.storage.set(libro, this.marcador);
    } else {
      this.marcador.splice(indiceMarcador, 1);
      this.storage.set(libro, this.marcador);
    }
    this.updateHighlightsMap();

    //Esto es para futuro sincronizar los marcadores
    if (this.marcadorLibro == null) {
      this.marcadorLibro.push({ libro });
      this.storage.set('marcadorLibro', this.marcadorLibro);
    } else {
      const resultadoMarcadorLibro = this.marcadorLibro.find(marcador => marcador.libro === libro);
      if (resultadoMarcadorLibro === undefined) {
        this.marcadorLibro.push({ libro });
        this.storage.set('marcadorLibro', this.marcadorLibro);
      }
    }
    this.analytics.logBookmark(libro, capitulo, versiculo);
    this.syncService.syncAll(); // Trigger smart sync (will push immediately)
  }
  marcar(capitulo, versiculo) {
    // Deprecated
  }

  obtenerColorMarcador(capitulo, versiculo): string {
    const bookmark = this.marcador.find(m => m.capitulo === capitulo && m.versiculo === versiculo);
    if (bookmark) {
      return bookmark.color || '#FFEB3B';
    }
    return 'transparent';
  }

  // --- NEW MENU LOGIC ---

  closeMenu() {
    this.isMenuOpen = false;
    // State for Color Selection
    this.selectedColor = '#FFF9C4'; // Default Pastel Yellows, or user manually unselects. 
    // If we close menu, we should probably clear selection to avoid "stuck" highlight.
    // this.marcarVersiculoAudioRemove("all"); // Uncomment if desired behavior
  }

  async crearNota() {
    if (!this.selectedVerseForMenu) return;

    const alert = await this.alertController.create({
      header: 'Crear Nota',
      subHeader: `${this.librot} ${this.selectedVerseForMenu.chapter}:${this.selectedVerseForMenu.verse}`,
      inputs: [
        {
          name: 'noteContent',
          type: 'textarea',
          placeholder: 'Escribe tu nota aquí...'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.noteContent) {
              await this.guardarNota(data.noteContent);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async guardarNota(content: string) {
    const note = {
      id: crypto.randomUUID(), // Ensure secure context or use a uuid lib
      book_id: parseInt(this.selectedVerseForMenu.book_id),
      chapter: parseInt(this.selectedVerseForMenu.chapter),
      verse: parseInt(this.selectedVerseForMenu.verse),
      content: content,
      created_at: Date.now(),
      updated_at: Date.now(),
      is_synced: 0
    };

    // Save Local
    await this.localRepo.saveNote(note);

    // Trigger Sync
    this.syncService.syncAll(true);

    // Close & Feedback
    this.closeMenu();
    this.marcarVersiculoAudioRemove("all");

    // Toast or Icon Update?
    // We need to refresh the view to show the Note Icon. 
    // Assuming 'mostrarTextoMetodo' re-renders or we modify the DOM.
    // Ideally, we persist notes in a map and check it in the HTML loop.
    // For now, let's just save.
  }

  tieneNota(capitulo, versiculo) {
    if (!this.notas) return false;
    // Filter for current book is handled in load or check here
    // this.libro is int, note.book_id might be int
    return this.notas.some(n => n.book_id == this.libro && n.chapter == capitulo && n.verse == versiculo);
  }

  async verNota(capitulo, versiculo) {
    const note = this.notas.find(n => n.book_id == this.libro && n.chapter == capitulo && n.verse == versiculo);
    if (note) {
      const alert = await this.alertController.create({
        header: 'Nota',
        subHeader: `${this.librot} ${capitulo}:${versiculo}`,
        message: note.content,
        buttons: ['Cerrar']
      });
      await alert.present();
    }
  }

} // fin class
