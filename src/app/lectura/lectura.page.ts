import { Component, OnInit, ViewChild, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { BibliaService } from '../services/biblia.service';
import Libros from '../../assets/libros.json';
import LibrosHebreo from '../../assets/librosHebreo.json';
import { IonContent, AlertController, NumericValueAccessor, NavController, ToastController } from '@ionic/angular';
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
import { from, Observable } from 'rxjs';

import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SyncService } from '../core/services/sync.service';
import { Note, Bookmark } from '../core/repositories/bible.repository';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { AudioPlayerService } from '../core/services/audio-player.service';


@Component({
  selector: 'app-lectura',
  templateUrl: 'lectura.page.html',
  styleUrls: ['lectura.page.scss']
})
export class LecturaPage implements OnInit {
  @ViewChild("myButton") myButton: ElementRef;
  libro: number = 43;
  LibrosPrueba;
  capitulo: number = 3;
  versiculo: number; // For context navigation
  primerP: Array<any> = new Array();
  segundoP: Array<any> = new Array();
  textoJson;
  titulos;
  citas;
  cantCapitulo: any[] = new Array;
  librot: string = '';
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
  progrss: any = "";
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
  // Audio State from Service
  isPlaying: boolean = false;
  playPausa: string = "play";
  share: boolean = false;
  copiaCondensado = [];
  pathDiviceIosAndroid: string;
  darkMode: boolean = true; // Kept for Backwards Compatibility if needed
  currentTheme: 'light' | 'sepia' | 'dark' = 'light';
  estadoDark: string = "moon";
  currentHighlightedVerse: any = null;
  // Selection Menu State
  isMenuOpen = false;
  selectedVerseForMenu: any = null;
  notas: Note[] = [];
  isNative: boolean = false;

  @ViewChild(IonContent) ionContent: IonContent;
  highlightsMap: { [key: string]: string } = {};

  get history() {
    return this.bibliaService.navigationHistory;
  }


  updateHighlightsMap() {
    this.highlightsMap = {};
    if (this.marcador) {
      for (const marca of this.marcador) {
        // marca is likely { versiculo: number, color: string } or similar
        // Need to verify structure from obtenerColorMarcador logic
        // For now, assuming standard structure
        const key = `${this.capitulo}:${marca.versiculo}`;
        this.highlightsMap[key] = marca.color;
      }
    }
  }

  // Method to Return to Origin
  async returnToContext() {
    const history = this.bibliaService.navigationHistory;
    if (history) {
      const { libro, capitulo, versiculo } = history;
      this.bibliaService.clearHistory(); // Clear history via service
      await this.mostrarTextoMetodo(libro, capitulo, versiculo);

      // Auto-scroll logic is reused in mostrarTextoMetodo's params or logic?
      // Wait, mostrarTextoMetodo sets this.versiculo but doesn't auto-scroll unless ionViewWillEnter.
      // We need to replicate scroll logic here if we are on same page.
      setTimeout(() => {
        const id = 'l' + versiculo;
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('versiculo-highlight');
          setTimeout(() => el.classList.remove('versiculo-highlight'), 3000);
        }
      }, 500);
    }
  }

  constructor(public navCtrl: NavController,
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
    public router: Router,
    private activeRoute: ActivatedRoute,
    public tabs: TabsPage,
    private elementRef: ElementRef,
    private syncService: SyncService,
    private socialSharing: SocialSharing,
    private audioService: AudioPlayerService,
    private toastController: ToastController) {

    this.tabs.validaUri();
    //this.guardarMarcador();
    this.platform.backButton.observers.pop();

    // Initialize Theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDark.matches) {
      this.currentTheme = 'dark';
      this.estadoDark = 'sunny'; // Icon to switch to Light
    } else {
      this.currentTheme = 'light';
      this.estadoDark = 'eye'; // Icon to switch to Sepia (Reading mode)
    }

    this.isNative = this.platform.is('cordova') || this.platform.is('capacitor');
  }


  async ngOnInit() {
    this.setupAudioSubscriptions();
    console.log("Update 1")
    console.log(this.platform.platforms())

    if (this.platform.is("android")) {
      this.pathDiviceIosAndroid = "/files/Documents/"
      console.log("***ANDROID***")
    } else if (this.platform.is("ios")) {
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
          if (val == entry.id) {
            this.librot = entry.libro;
          }
        }
        console.log("libro " + this.libro + " " + this.librot);
      } else {
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
        this.mostrarTextoMetodo(this.libro, this.capitulo);
        // console.log(val);
      } else {
        this.capitulo = 3;
        this.mostrarTextoMetodo(this.libro, this.capitulo);
      }
    });


    await this.storage.set('playAuto', false);
    console.log('1')

    //await this.audioReproductor();



    // this.storage.get(this.libro.toString()).then((val) => {
    //   if (val == null) {
    //     this.marcador = [];
    //   } else {
    //     this.marcador = val;
    //   }
    // });
    this.bibliaService.getBookmarks(this.libro).then(bookmarks => {
      this.marcador = bookmarks.map(b => ({ capitulo: b.chapter, versiculo: b.verse }));
    });

    // this.storage.remove('marcadorLibro');
    // this.storage.get('marcadorLibro').then((val) => {
    //   if (val == null) {
    //     this.marcadorLibro = [];
    //   } else {
    //     this.marcadorLibro = val;
    //   }
    // });

    this.getcapitulos(this.libro);
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
        this.primerP.push({ id: entry.id, capitulos: entry.capitulos, libro: this.getCleanedString(entry.libro), estado: 'listo' });
      } else {
        this.segundoP.push({ id: entry.id, capitulos: entry.capitulos, libro: this.getCleanedString(entry.libro), estado: 'listo' });
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

  ionViewWillEnter() {
    this.activeRoute.queryParams.subscribe(params => {
      if (params && params.libro && params.capitulo) {
        const targetLibro = parseInt(params.libro);
        const targetCapitulo = parseInt(params.capitulo);
        const targetVersiculo = params.versiculo ? parseInt(params.versiculo) : null;

        // If content needs update
        if (this.libro !== targetLibro || this.capitulo !== targetCapitulo) {
          this.mostrarTextoMetodo(targetLibro, targetCapitulo).then(() => {
            if (targetVersiculo) {
              // Give Angular time to render the new list
              this.waitForElementAndScroll(targetVersiculo);
            }
          });
        } else if (targetVersiculo) {
          // Same chapter, just scroll
          this.waitForElementAndScroll(targetVersiculo);
        }
      }
    });
  }

  // Helper with simple retry logic
  waitForElementAndScroll(verse: number, attempt = 1) {
    if (attempt > 10) return; // Give up after ~2 seconds

    const id = 'l' + verse;
    const el = document.getElementById(id);

    if (el) {
      this.scrollToVerse(verse);
    } else {
      setTimeout(() => {
        this.waitForElementAndScroll(verse, attempt + 1);
      }, 200);
    }
  }

  scrollToVerse(verse: number) {
    const id = 'l' + verse;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Remove previous highlight if any
      const prev = document.querySelectorAll('.versiculo-highlight');
      prev.forEach(p => p.classList.remove('versiculo-highlight'));

      // Add highlight
      el.classList.add('versiculo-highlight');

      // Remove after 3 seconds
      setTimeout(() => {
        if (el) el.classList.remove('versiculo-highlight');
      }, 3000);
    }
  }

  setupAudioSubscriptions() {
    this.audioService.isPlaying$.subscribe(playing => {
      this.isPlaying = playing;
      this.playPausa = playing ? 'pause' : 'play';
      if (!playing && this.currentHighlightedVerse) {
        this.marcarVersiculoAudioRemove(this.currentHighlightedVerse);
        this.currentHighlightedVerse = null;
      }
    });

    this.audioService.currentVerse$.subscribe(verse => {
      if (verse !== null && verse !== this.currentHighlightedVerse) {
        if (this.currentHighlightedVerse) {
          this.marcarVersiculoAudioRemove(this.currentHighlightedVerse);
        }
        this.currentHighlightedVerse = verse;
        this.marcarVersiculoAudioAdd(verse);

        const id = 'l' + verse;
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (verse === null && this.currentHighlightedVerse) {
        this.marcarVersiculoAudioRemove(this.currentHighlightedVerse);
        this.currentHighlightedVerse = null;
      }
    });
  }

  botonclick(link) {
    //this.router.navigate(["/tabs/tab1",'#parte1']);
    let n = "10"
    this.router.navigate(['/tabs/lectura'], { fragment: n });
  }


  async playAudio() {
    if (this.isPlaying) {
      this.audioService.pauseAudio();
    } else {
      // Logic to resolve path
      // Default to remote URL so it works if local fails
      let audioSrc = "https://sionlecheymiel.com/file/audios/" + this.libro + "/" + this.capitulo + ".mp3";

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

  marcarVersiculoAudioAdd(versiculo) {
    const id = 'l' + versiculo;
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
      const id = 'l' + versiculo;
      const el = document.getElementById(id);
      if (el) el.classList.remove('versiculo-highlight');
    }
  }


  ngAfterViewInit(): void {
    this.router.navigate(['/tabs/lectura'], { fragment: "" });    //Esto es para linpiar el fragment la url #

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
      this.librosTodos = Libros;
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
    cadena = cadena.replace(/á/gi, "a");
    cadena = cadena.replace(/Éxodo/gi, "Exodo");
    cadena = cadena.replace(/é/gi, "e");
    cadena = cadena.replace(/í/gi, "i");
    cadena = cadena.replace(/ó/gi, "o");
    cadena = cadena.replace(/ú/gi, "u");
    cadena = cadena.replace(/ñ/gi, "n");
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
      } else {
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
    this.bibliaService.clearHistory(); // Clear history via service
    this.router.navigate(['/tabs/lectura'], { fragment: "" });

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
      this.mostrarTexto = !this.mostrarTexto;
    }
    this.mostrarCapitulos = !this.mostrarCapitulos;
    // console.log (libro);
    // console.log (capitulo);
  }

  actualizarLibroTitulo(libro) {
    for (let entry of Libros) {
      if (libro == entry.id) {
        this.librot = entry.libro;
      }
    }
    this.getcapitulos(this.libro);
  }

  async mostrarTextoMetodo(libro: any, capitulo: any, versiculo?: any, versiculoFinal?: any) {
    if (versiculo) this.versiculo = versiculo;
    this.ionContent.scrollToTop(300);
    this.marcarVersiculoAudioRemove("all")
    this.router.navigate(['/tabs/lectura'], { fragment: "" });

    this.citas = [];
    this.storage.set('libro', parseInt(libro));
    this.storage.set('capitulo', capitulo);
    this.storage.get(libro.toString()).then((val) => {
      if (val == null) {
        this.marcador = [];
      } else {
        // console.log("marcador "+val);
        this.marcador = val;
      }
    });

    // Load Notes
    this.notas = await this.bibliaService.getNotes();

    this.mostrarCapitulos = false;
    this.libro = libro;
    this.capitulo = capitulo;
    this.actualizarLibroTitulo(this.libro);

    if (this.isPlaying) {
      this.audioService.stopAudio();
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
      }).catch(async err => {
        this.storage.remove('update');
        this.textoJsonFinal = await this.bibliaService.getTextoImport(this.libro, this.capitulo);
      });
    } else {
      this.textoJsonFinal = await this.bibliaService.getTextoImport(this.libro, this.capitulo);
    }

    // Inject Metadata for robustness
    if (this.textoJsonFinal) {
      this.textoJsonFinal.forEach(t => {
        if (!t.id_libro) t.id_libro = this.libro;
        if (!t.capitulo) t.capitulo = this.capitulo;
      });
    }

    this.updateHighlightsMap();
    console.log("textoJsonFinal***********")
    console.log(this.textoJsonFinal)

    this.mostrarTexto = true;
  }

  // Removed deprecated audioReproductor, calculateTimeMap


  async previousboton() {

    this.ionContent.scrollToTop(300);
    // this.scrollToTop();
    if (this.libro >= 1 && this.capitulo > 1) {
      this.capitulo--;
      this.mostrarTextoMetodo(this.libro, this.capitulo);
    } else if (this.libro >= 1 && this.capitulo == 1 && this.libro != 1) {
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
    this.router.navigate(['/tabs/lectura'], { fragment: "" });
    this.marcarVersiculoAudioRemove("all")

    if (this.isPlaying) {
      this.audioService.stopAudio();
    }

  }

  async nextboton() {

    this.ionContent.scrollToTop(300);

    // this.scrollToTop();
    //console.log(this.libro);
    //console.log(this.cantCapitulo);
    //console.log (this.cantCapitulo.length);
    if (this.libro <= 66 && this.capitulo < this.cantCapitulo.length) {
      this.capitulo++;
      this.mostrarTextoMetodo(this.libro, this.capitulo);
    } else if (this.libro <= 66 && this.capitulo == this.cantCapitulo.length && this.libro != 66) {
      this.libro++;
      for (let entry of Libros) {
        if (this.libro == +entry.id) {
          this.librot = entry.libro;
          this.capitulo = 1;
        }
      }
      this.mostrarTextoMetodo(this.libro, this.capitulo);
    }
    this.router.navigate(['/tabs/lectura'], { fragment: "" });
    this.marcarVersiculoAudioRemove("all")

    if (this.isPlaying) {
      this.audioService.stopAudio();
    }

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
              parteText: text.texto.substring(posicionInicial, citaVersiculo.posicion).replace(/(&nbsp;|\u00A0|\s)+/g, ' ').trim(),
              ibroCita: citaVersiculo.libroCita,
              capituloCita: citaVersiculo.capituloCita,
              versiculoCitaInicial: citaVersiculo.versiculoCitaInicial,
              versiculoCitaFinal: citaVersiculo.versiculoCitaFinal,
              posicion: citaVersiculo.posicion,
              parteFinal: text.texto.substring(citaVersiculo.posicion, text.texto.length).replace(/(&nbsp;|\u00A0|\s)+/g, ' ').trim()
            });
          } else {
            this.mapText.push({
              id_libro: text.id_libro,
              capitulo: text.capitulo,
              versiculo: citaVersiculo.versiculo,
              cita: citaVersiculo.cita,
              parteText: text.texto.substring(posicionInicial, citaVersiculo.posicion).replace(/(&nbsp;|\u00A0|\s)+/g, ' ').trim(),
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
        this.textoJsonFinal.push({ versiculo: this.versiculoTEMP, comprimido: this.mapText });
      } else {
        if (text.texto) text.texto = text.texto.replace(/(&nbsp;|\u00A0|\s)+/g, ' ').trim();
        this.textoJsonFinal.push(text);
      }
    }

    console.log(this.textoJsonFinal);


  }

  // ________________________________________________________________________________________________

  async citaAlert(cita, idLibroCita, capituloC, verInicial, originVersiculo) {
    if (this.update) {
      await this.bibliaService.getTextoFile(idLibroCita, capituloC).then((data) => {
        this.arregloTextoCita = JSON.parse(data);
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
        this.mostrarCitaAlert(cita, this.textoCita, idLibroCita, capituloC, verInicial, originVersiculo);
        this.textoCita = '';
      });
    } else {
      this.arregloTextoCita = await this.bibliaService.getTextoImport(idLibroCita, capituloC);
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
      this.mostrarCitaAlert(cita, this.textoCita, idLibroCita, capituloC, verInicial, originVersiculo);
      this.textoCita = '';
    }
  }

  async mostrarCitaAlert(cita, textoVersiculo, idLibro, capituloC, versiculo, originVersiculo) {
    const alert = await this.alertController.create({
      header: cita,
      message: textoVersiculo,
      buttons: [
        { text: 'OK' },
        {
          text: 'Leer contexto',
          handler: async () => {
            if (this.isPlaying) {
              this.audioService.stopAudio();
              this.marcarVersiculoAudioRemove("all")
            }
            // Save Origin BEFORE navigating using Service
            this.bibliaService.setHistory(this.libro, this.capitulo, originVersiculo || this.versiculo || 1);
            // Navigate and load context
            await this.mostrarTextoMetodo(idLibro, capituloC, versiculo);

            // Scroll to verse after rendering
            setTimeout(() => {
              const id = 'l' + versiculo;
              const el = document.getElementById(id);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add temporary highlight animation
                el.classList.add('versiculo-highlight');
                // Remove after a delay for temporary flash
                setTimeout(() => el.classList.remove('versiculo-highlight'), 3000);

                // Update Menu/Selection State effectively
                this.libro = idLibro;
                this.capitulo = capituloC;
                this.versiculo = versiculo;
              }
            }, 500); // Wait for DOM update
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
      console.log(this.dataTemp)
      for (let text of this.textoJsonFinal) {
        if (versiculo == text.versiculo) {
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


    }
  }

  async seleccionarVersiculo(texto, idLibro, capitulo, versiculo) {
    const el = document.getElementById('l' + versiculo);
    if (el) el.classList.toggle('versiculo-highlight');
    await this.buscarVersiculo(idLibro, capitulo, versiculo);
    let arreglo = [idLibro, capitulo, versiculo, this.textTemp]
    if (this.copiaCondensado[versiculo] == null) {
      this.copiaCondensado[versiculo] = arreglo
      console.log(this.copiaCondensado.length)
    } else {
      this.copiaCondensado.splice(versiculo, 1);
      //delete this.copiaCondensado[versiculo]
    }
    // Multi-select logic is handled by copiaCondensado updates above
    let contador = 0
    for (let clave in this.copiaCondensado) {
      contador++
    }
    // Sync Menu State with Count
    if (contador > 0) {
      this.share = true;
      // Force menu open if not already open (or keep it open)
      if (!this.isMenuOpen) {
        this.isMenuOpen = true;
      }

      // Update "selectedVerseForMenu" to the LATEST selected 
      this.selectedVerseForMenu = {
        book_id: idLibro,
        chapter: capitulo,
        verse: versiculo,
        content: this.textTemp
      };
    } else {
      // If count is 0, auto-close
      this.share = false
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

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  copiarVersiculo() {
    let textTemp = "";
    let firstVerse = null;
    let isFirst = true;

    for (let clave in this.copiaCondensado) {
      if (isFirst) {
        firstVerse = this.copiaCondensado[clave][2];
        // For the first verse, we don't repeat the number in the body, as it will be in the header 3:16
        textTemp = this.copiaCondensado[clave][3];
        isFirst = false;
      } else {
        // Subsequent verses maintain the number: " 17 content"
        textTemp = textTemp + " " + this.copiaCondensado[clave][2] + " " + this.copiaCondensado[clave][3];
      }
    }

    const deepLink = `https://sionlecheymiel.com/app/bible/${this.libro}/${this.capitulo}/${firstVerse || 1}`;
    // Format: Biblia "Sion: Leche y Miel" [Libro] [Cap]:[Ver] [Contenido]
    const clipboardText = `Biblia "Sion: Leche y Miel" ${this.librot} ${this.capitulo}:${firstVerse || 1} ${textTemp}\n\nLeer aquí: ${deepLink}`;

    if (this.isNative) {
      this.clipboard.copy(clipboardText);
      this.presentToast("Copiado al portapapeles");
    } else {
      // Web Fallback (Chrome Desktop requires this)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(clipboardText).then(() => {
          this.presentToast("Enlace copiado al portapapeles");
        }).catch(err => {
          console.error('Error al copiar: ', err);
          this.presentToast("Error al copiar. Intente manualmente.");
        });
      } else {
        console.warn("Clipboard API not available");
        this.presentToast("No se pudo copiar (Navegador no soportado)");
      }
    }

    this.marcarVersiculoAudioRemove("all");
    this.isMenuOpen = false;
  }

  async compartirVersiculo() {
    let textTemp = "";
    let firstVerse = null;
    let isFirst = true;

    for (let clave in this.copiaCondensado) {
      if (isFirst) {
        firstVerse = this.copiaCondensado[clave][2];
        textTemp = this.copiaCondensado[clave][3];
        isFirst = false;
      } else {
        textTemp = textTemp + " " + this.copiaCondensado[clave][2] + " " + this.copiaCondensado[clave][3];
      }
    }

    const deepLink = `https://sionlecheymiel.com/app/bible/${this.libro}/${this.capitulo}/${firstVerse || 1}`;
    const shareMsg = `Biblia "Sion: Leche y Miel" ${this.librot} ${this.capitulo}:${firstVerse || 1} ${textTemp}\n\nLeer aquí: ${deepLink}`;

    if (this.isNative) {
      this.socialSharing.share(shareMsg, null, null, null).then(() => {
        this.marcarVersiculoAudioRemove("all");
        this.isMenuOpen = false;
      }).catch((error) => {
        console.error("Share failed", error);
        this.copiarVersiculo();
      });
    } else {
      // Web Share API
      if (navigator.share) {
        navigator.share({
          title: `Biblia Sion: ${this.librot} ${this.capitulo}`,
          text: shareMsg,
          url: deepLink,
        })
          .then(() => {
            this.marcarVersiculoAudioRemove("all");
            this.isMenuOpen = false;
          })
          .catch((error) => {
            console.log('Error sharing or cancelled', error);
            // If user catches, maybe they want to copy instead?
            // On desktop this usually fails or isn't present
          });
      } else {
        // Fallback for Chrome Desktop
        this.copiarVersiculo();
      }
    }
  }

  aumentarSize() {
    if (this.fontSize < 30) {
      this.fontSize = this.fontSize + 1;
      this.storage.set("fontSize", this.fontSize);
    }
  }
  disminuirSize() {
    if (this.fontSize > 18) {
      this.fontSize--
      this.storage.set('fontSize', this.fontSize);
    }
  }



  // ...

  async marcarVersiculo() {
    for (let clave in this.copiaCondensado) {
      await this.guardarMarcador(this.copiaCondensado[clave][0], this.copiaCondensado[clave][1], this.copiaCondensado[clave][2], this.selectedColor);
    }
    this.marcarVersiculoAudioRemove("all")
    this.isMenuOpen = false;
  }

  async guardarMarcador(libro, capitulo, versiculo, color = '#FFF9C4') {
    const resultadoMarcador = this.marcador.find(marcador => marcador.capitulo === capitulo && marcador.versiculo === versiculo);
    let indiceMarcador = this.marcador.findIndex(marcador => marcador.capitulo === capitulo && marcador.versiculo === versiculo);

    if (resultadoMarcador === undefined) {
      // Add to local UI array
      this.marcador.push({
        capitulo: capitulo,
        versiculo: versiculo,
        color: color  // Add color support locally
      });

      // Construct Bookmark Object correctly for Repo
      const newBookmark: Bookmark = {
        id: this.generateUUID(),
        book_id: libro,
        chapter: capitulo,
        verse: versiculo,
        color: color,
        created_at: Date.now(),
        updated_at: Date.now(),
        is_synced: 0
      };

      // Save to SQLite via Repo
      await this.bibliaService.saveBookmark(newBookmark);
    } else {
      // Remove from local UI array
      this.marcador.splice(indiceMarcador, 1);
      // Remove from SQLite via Repo
      await this.bibliaService.deleteBookmarkByRef(libro, capitulo, versiculo);
    }
    this.updateHighlightsMap();
  }
  marcar(capitulo, versiculo) {
    // Deprecated for style binding, kept if needed for other logic or can be removed.
    // Replaced by obtenerColorMarcador
  }

  obtenerColorMarcador(capitulo, versiculo): string {
    const bookmark = this.marcador.find(m => m.capitulo === capitulo && m.versiculo === versiculo);
    if (bookmark) {
      return bookmark.color || '#FFEB3B'; // Return saved color or default yellow
    }
    return null; // Return null to allow CSS class (.versiculo-highlight) to show
  }

  // --- MENU & NOTE LOGIC ---

  closeMenu() {
    this.isMenuOpen = false;
    // Optional: Clear selection depending on UX preference
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
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
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
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
    const note: Note = {
      id: this.generateUUID(),
      book_id: parseInt(this.selectedVerseForMenu.book_id),
      chapter: parseInt(this.selectedVerseForMenu.chapter),
      verse: parseInt(this.selectedVerseForMenu.verse),
      content: content,
      created_at: Date.now(),
      updated_at: Date.now(),
      is_synced: 0
    };

    await this.bibliaService.saveNote(note);
    this.syncService.syncAll(true);

    // Refresh Notes
    this.notas = await this.bibliaService.getNotes();

    this.closeMenu();
    this.marcarVersiculoAudioRemove("all");
  }

  async verNota(capitulo, versiculo) {
    const nota = this.notas.find(n => n.chapter == capitulo && n.verse == versiculo);
    if (nota) {
      const alert = await this.alertController.create({
        header: 'Nota',
        subHeader: `${this.librot} ${capitulo}:${versiculo}`,
        message: nota.content,
        buttons: [
          {
            text: 'Editar',
            handler: () => {
              this.editarNota(nota);
            }
          },
          {
            text: 'Eliminar',
            role: 'destructive',
            handler: () => {
              this.eliminarNota(nota);
            }
          },
          { text: 'Cerrar', role: 'cancel' }
        ]
      });
      await alert.present();
    }
  }

  async editarNota(nota) {
    const alert = await this.alertController.create({
      header: 'Editar Nota',
      inputs: [
        {
          name: 'noteContent',
          type: 'textarea',
          value: nota.content
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.noteContent) {
              nota.content = data.noteContent;
              nota.updated_at = Date.now();
              nota.is_synced = 0;
              await this.bibliaService.saveNote(nota);
              this.syncService.syncAll(true); // Background sync
              this.notas = await this.bibliaService.getNotes(); // Refresh
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminarNota(nota) {
    await this.bibliaService.deleteNote(nota.id);
    this.notas = await this.bibliaService.getNotes();
  }

  tieneNota(capitulo, versiculo) {
    if (!this.notas) return false;
    // this.libro is int, note.book_id is int
    return this.notas.some(n => n.book_id == this.libro && n.chapter == capitulo && n.verse == versiculo);
  }


  // State for Color Selection
  selectedColor: string = '#FFF9C4'; // Default Pastel Yellow

  seleccionarColor(color) {
    console.log("Color selected:", color);
    this.selectedColor = color;
    // Do NOT close menu. Visual feedback will be handled in HTML.
  }

}
