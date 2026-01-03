import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BibliaService } from '../services/biblia.service';
import { Storage as IonicStorage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import Libros from '../../assets/libros.json';
import SLM from '../../assets/SLM.json';

@Component({
  selector: 'app-concordancia',
  templateUrl: 'concordancia.page.html',
  styleUrls: ['concordancia.page.scss']
})
export class ConcordanciaPage {

  versiculos: Array<any> = new Array(); // Displayed verses
  allVerses: Array<any> = [];     // All verses loaded from JSON
  searchResults: Array<any> = []; // All matches found

  palabra;
  libros;
  fontSize;
  concordanciaForm: UntypedFormGroup;

  // State flags
  isLoading = false;
  hasMoreResults = false;
  showText = false;

  // Pagination
  currentPage = 0;
  pageSize = 50;

  // Documentacion de formulario login https://www.youtube.com/watch?v=2vVxieW-yyE

  constructor(private bibliaService: BibliaService,
    private storage: IonicStorage,
    public formBuilder: UntypedFormBuilder,
    public loadingController: LoadingController,
    private sanitizer: DomSanitizer,
    private router: Router,
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



  ngOnInit() {
    // 1. Pre-load and normalize data ONCE
    this.loadDatabase();
  }

  loadDatabase() {
    // Load raw data
    const rawData = SLM as any[];
    // Pre-process: Create a normalized version of text for fast searching
    // and map book IDs to names efficiently.
    this.allVerses = rawData.map(v => ({
      ...v,
      normalizedText: this.normalizeText(v.texto), // Pre-compute for speed
      nombreLibro: this.getlibroId(v.id_libro)
    }));
  }

  normalizeText(text: string): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  // Evento del boton
  async getItems() {
    const query = this.concordanciaForm.value.palablaBuscar;
    if (!query || query.length < 3) return;

    this.isLoading = true;
    this.showText = false;
    this.presentLoading();

    // Give UI a moment to show loading
    setTimeout(() => {
      this.performSearch(query);
      this.loadingController.dismiss();
      this.isLoading = false;
    }, 100);
  }

  performSearch(query: string) {
    this.searchResults = [];
    this.versiculos = [];
    this.currentPage = 0;
    this.palabra = query;

    const normalizedQuery = this.normalizeText(query);
    const tokens = normalizedQuery.split(' ').filter(t => t.length > 0);

    if (tokens.length === 0) return;

    // Fast Filter with AND logic
    this.searchResults = this.allVerses.filter(verse => {
      // Every token must be present in the verse's normalized text
      return tokens.every(token => verse.normalizedText.includes(token));
    });

    if (this.searchResults.length > 0) {
      this.showText = true;
      this.loadMoreResults();
    } else {
      this.presentLoadingWithOptions(); // Show "No Found"
    }
  }

  loadMoreResults() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    const nextChunk = this.searchResults.slice(start, end);

    // Highlight matches in the chunk before displaying
    const tokens = this.normalizeText(this.palabra).split(' ').filter(t => t.length > 0);

    const processedChunk = nextChunk.map(v => {
      // Clone to avoid modifying the source-of-truth
      const displayVerse = { ...v };
      displayVerse.textoHTML = this.highlightText(v.texto, tokens);
      return displayVerse;
    });

    this.versiculos = [...this.versiculos, ...processedChunk];
    this.currentPage++;
    this.hasMoreResults = this.versiculos.length < this.searchResults.length;
  }

  goToContext(versiculo: any) {
    // Navigates to LecturaPage passing the coordinates
    // We assume /tabs/lectura is the route
    this.router.navigate(['/tabs/lectura'], {
      queryParams: {
        libro: versiculo.id_libro,
        capitulo: versiculo.capitulo,
        versiculo: versiculo.versiculo
      }
    });
  }

  highlightText(text: string, tokens: string[]): SafeHtml {
    let highlighted = text;

    // Sort tokens by length desc? Not critical but good practice.
    // For now, iterate tokens and highlight.
    tokens.forEach(token => {
      // Create flexible regex for accents in source text
      const regexStr = token
        .replace(/[aá]/g, '[aá]')
        .replace(/[eé]/g, '[eé]')
        .replace(/[ií]/g, '[ií]')
        .replace(/[oó]/g, '[oó]')
        .replace(/[uú]/g, '[uú]');

      highlighted = highlighted.replace(new RegExp(`(${regexStr})`, 'gi'), '<span style="color:#9E7F2A; font-weight:bold;">$1</span>');
    });
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  getlibroId(id) {
    for (let entry of Libros) {
      if (id == entry.id) {
        return (entry.libro);
      }
    }
    return '';
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Buscando...',
      duration: 5000
    });
    await loading.present();
    return loading;
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
