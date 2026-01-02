import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-bible-viewer',
  templateUrl: './bible-viewer.component.html',
  styleUrls: ['./bible-viewer.component.scss'],
})
export class BibleViewerComponent implements OnInit {

  @Input() content: any[] = [];
  @Input() fontSize: number = 20;
  @Input() notes: any[] = [];
  @Input() idPrefix: string = 'l';
  // For highlighting, we can pass a map or check usage. 
  // Currently parent uses obtainingColorMarcador. We can replicate logic or pass a function.
  // Passing function is tricky. Better to pass list of highlighted verses?
  // Or handle logic here if we have the list.
  // Let's assume parent manages highlighting colors via a service or state, 
  // OR we pass reference to the "planOfStora" / "bookmarks".
  // SIMPLIFICATION: Pass a "highlightsMap" { 'chapter:verse': 'color' }?
  // For now, let's keep basic structure. We need 'obtenerColorMarcador'.
  // Since 'obtenerColorMarcador' depends on complex logic (bookmarks, current plan progress),
  // it might be best to pass it OR bind to it.

  // Actually, 'obtenerColorMarcador' is in the Page. 
  // We can pass a wrapper function from the parent? 
  // Input() markerColorFn: (chapter, verse) => string;
  // Angular doesn't like passing functions in templates easily due to 'this' binding context.
  // Better approach: @Input() highlights: { [key: string]: string } = {}; where key is `capitulo:versiculo`

  @Input() highlights: { [key: string]: string } = {};

  @Output() verseClick = new EventEmitter<any>();
  @Output() noteClick = new EventEmitter<any>();
  @Output() citationClick = new EventEmitter<any>();

  constructor() { }

  ngOnInit() { }

  onVerseClick(idLibro: number, capitulo: number, versiculo: number, texto: string) {
    this.verseClick.emit({ idLibro, capitulo, versiculo, texto });
  }

  onNoteClick(capitulo: number, versiculo: number) {
    this.noteClick.emit({ capitulo, versiculo });
  }

  onCitationClick(citationData: any) {
    this.citationClick.emit(citationData);
  }

  tieneNota(capitulo: number, versiculo: number): boolean {
    // Logic extracted from Pages
    // We assume 'notes' contains objects with { chapter, verse }
    // Parent should filter notes for the CURRENT BOOK if strictly needed, 
    // OR we check book_id here if passed.
    // Ideally parent passes ONLY relevant notes or we check all fields.
    // 'notes' is likely 'this.notas'.
    // We might need 'bookId' as Input to specific filtering.
    // But 'content' has 'id_libro'.
    if (!this.notes) return false;

    // We need to find if ANY note matches this chapter/verse for the current book.
    // Issue: We don't have 'currentBookId' as a global input here easily unless we look at 'text.id_libro'
    // But 'text' is inside the loop.
    return this.notes.some(n => n.chapter == capitulo && n.verse == versiculo); // Simplified check. Add book_id check if notes are mixed books.
  }

  // Helper to ensure strict safe checking if multiple books are loaded? 
  // Notes usually are loaded for specific book in Page.

  obtenerColorMarcador(capitulo: number, versiculo: number): string {
    const key = `${capitulo}:${versiculo}`;
    return this.highlights[key] || 'transparent';
  }

}
