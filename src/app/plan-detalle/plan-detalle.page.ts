import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
// import bibleOneYear from '../../assets/bibleOneYear.json';
import planesFile from '../../assets/planesLectura.json';
import { ActivatedRoute } from '@angular/router';
import Libros from '../../assets/libros.json';
import { NavController } from '@ionic/angular';
import { Storage as IonicStorage } from '@ionic/storage-angular';
import { Console } from 'console';
import { Router } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BibliaService } from '../services/biblia.service';


@Component({
  selector: 'app-plan-detalle',
  templateUrl: './plan-detalle.page.html',
  styleUrls: ['./plan-detalle.page.scss'],
})
export class PlanDetallePage implements OnInit {
  @ViewChild('swiper') swiperRef: ElementRef | undefined;

  bibleOneYear;
  planOfStora;
  temporalPlan;
  planes = planesFile;
  slideOpts = {
    slidesPerView: 6,
    initialSlide: 0,
    speed: 500
  };
  nombrePlan = null;
  titulo;
  imagen;
  uri;
  descripcion;
  libro;
  dia;
  detallesDia;
  libroT;
  verCapitulos = false;
  marcarSlite = false;
  planesActivos: Array<any> = new Array();
  btnIniciarPlan = true;
  yearValues = 2020;
  fecha = new Date();
  dd; mm; yyyy;
  mmS;
  ddStora; mmStora; yyyyStora;
  fechaHoy;
  diaLecturaV;
  meses = [
    { numero: 1, mes: "ENE", cantidad: 31 },
    { numero: 2, mes: "FEB", cantidad: 28 },
    { numero: 3, mes: "MAR", cantidad: 31 },
    { numero: 4, mes: "ABR", cantidad: 30 },
    { numero: 5, mes: "MAY", cantidad: 31 },
    { numero: 6, mes: "JUN", cantidad: 30 },
    { numero: 7, mes: "JUL", cantidad: 31 },
    { numero: 8, mes: "AGO", cantidad: 31 },
    { numero: 9, mes: "SEP", cantidad: 30 },
    { numero: 10, mes: "OCT", cantidad: 31 },
    { numero: 11, mes: "NOV", cantidad: 30 },
    { numero: 12, mes: "DIC", cantidad: 31 }
  ];
  verBadge = false;
  diaAtraso;
  verDiaAtraso;
  planArrayTemp: Array<any> = new Array();
  diaFinPlan;
  posicionSlide: number;
  // Optimized Rendering
  renderedDays: any[] = [];
  RENDER_WINDOW = 30; // Show 30 days around current
  el;
  activarDia;


  constructor(
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private storage: IonicStorage,
    private router: Router,
    private httpClient: HttpClient,
    private bibliaService: BibliaService
  ) {

  }
  ionViewWillEnter() {                           // Este es para que refresque las variables del storag
    this.ngOnInit();
  }

  ionViewDidLoad() {
    this.ngOnInit();
  }

  ionViewCanEnter() {
    //this.ngOnInit();
  }

  async ngOnInit() {

    this.dd = this.fecha.getDate();
    this.mm = this.fecha.getMonth() + 1;
    this.yyyy = this.fecha.getFullYear();
    this.mmS = this.addMMM(this.mm);

    this.nombrePlan = this.activatedRoute.snapshot.paramMap.get('id');
    console.log(this.nombrePlan);
    for (let entry of this.planes) {
      if (this.nombrePlan === entry.nombre) {
        this.titulo = entry.titulo;
        this.imagen = entry.imagen;
        this.descripcion = entry.descripcion;
        // this.temporalPlan = require(`../../assets/planes/${entry.nombre}.json`);
        this.temporalPlan = await firstValueFrom(this.httpClient.get<any>(`/assets/planes/${entry.nombre}.json`));
        // console.log(this.bibleOneYear);

      }
    }
    // this.storage.remove('bibleOneYear');
    // Load active plan metadata (Start Date) from Storage (Settings)
    // Load active plan metadata (Start Date) from Storage (Settings)
    await this.storage.get('planesActivos').then((val) => {
      this.planesActivos = val || []; // Load ALL plans or init empty
      if (val === null) {
        this.btnIniciarPlan = true;
      } else {
        // Check if CURRENT plan is in the list
        const activePlan = this.planesActivos.find(p => p.nombre === this.nombrePlan);

        if (activePlan) {
          console.log('Desde  if dentre del planes activo ');
          this.btnIniciarPlan = false;
          console.log('this.btnIniciarPlan ' + this.btnIniciarPlan);
          this.ddStora = activePlan.diaInicio;
          this.mmStora = activePlan.mesInicio;
          this.yyyyStora = activePlan.anoInicio;
        } else {
          this.btnIniciarPlan = true;
        }
      }
    });

    // NEW LOGIC: Always use static assets as base, then merge progress from SQLite
    this.planOfStora = this.temporalPlan;

    // Fetch progress from SQLite
    const progressList = await this.bibliaService.getReadingProgress(this.nombrePlan);
    // Create a Set of completed Day IDs for O(1) lookup
    const completedDays = new Set(progressList.filter(p => p.status === 1).map(p => p.day_id));

    console.log('SQLite Progress Loaded:', completedDays);

    // Merge Progress
    if (this.planOfStora) {
      for (let day of this.planOfStora) {
        const dayId = Number(day.dia);
        if (completedDays.has(dayId)) {
          day.statusDia = true;
          // Mark all details as done since our SQLite schema currently tracks Day granularity
          if (day.detalles) {
            day.detalles.forEach(d => d.status = true);
          }
        } else {
          day.statusDia = false;
          // Leave details as false/undefined
          if (day.detalles) {
            day.detalles.forEach(d => d.status = false);
          }
        }
      }
    }

    /* LEGACY STORAGE LOGIC REMOVED
    await this.storage.get(this.nombrePlan).then((val) => {
      if (val === null) {
        console.log('Plan no almacenado o no asignado');
        // this.storage.set('bibleOneYear', this.temporalPlan);
        this.planOfStora = this.temporalPlan;     // El plan temporalPlan = planOfStora
      } else {
        console.log('Se obtubo desde bibleOneYearStora ');
        // this.bibleOneYearStora = val;
        this.planOfStora = val;
      }
      console.log('Desde el storage');
      console.log(this.planOfStora);
    });
    */

    console.log('yyyyStora yyyyStora yyyyStora yyyyStora');
    console.log(this.yyyyStora);
    if (this.yyyyStora !== undefined) {
      if (this.yyyyStora === this.yyyy) {
        if (this.mmStora === this.mm) {
          this.diaLecturaV = ((this.dd + 1) - this.ddStora).toString();
        } else {
          for (let mes of this.meses) {
            if (mes.numero === this.mmStora) {
              this.diaLecturaV = (mes.cantidad + 1) - this.ddStora;
            } else if (mes.numero > this.mmStora && mes.numero < this.mm) {
              this.diaLecturaV = this.diaLecturaV + mes.cantidad;
            } else if (mes.numero > this.mmStora && mes.numero === this.mm) {
              this.diaLecturaV = (this.diaLecturaV + this.dd).toString();
            }
          }
        }
      }
    } else {
      this.diaLecturaV = '1';
    }

    this.diaFinPlan = this.planOfStora.length;
    await this.estadoPlan();

    let diaT;
    for (let dia of this.planOfStora) {
      //console.log();
      //console.log('dia de lectura ' + this.diaLecturaV);
      //if (dia.dia == this.posicionSlide ) {   //antes this.diaLecturaV  //este if fue cambiado por el anterior
      if (!dia.statusDia) {
        console.log(' Dentro del IF Va en el dia ' + dia.dia);
        diaT = dia.dia
        await this.obtenerLibroCapitulos(dia.dia, dia.libro, dia.detalles);
        await this.statusSlide(dia.dia);
        this.marcarSlite = true;
        this.verBadge = true;
        break;
      }

    }
    if (parseInt(this.diaLecturaV) >= parseInt(diaT)) {

      if (parseInt(this.diaLecturaV) > this.diaFinPlan) {
        this.diaAtraso = this.diaFinPlan - parseInt(diaT);
      } else {
        this.diaAtraso = parseInt(this.diaLecturaV) - parseInt(diaT);
      }
      if (this.diaAtraso === 0) {
        this.verDiaAtraso = false;
      } else {
        this.verDiaAtraso = true;
      }
      console.log("dias de atraso " + this.diaAtraso);
    }

    this.posicionSlide = await parseInt(this.diaLecturaV) - parseInt(this.diaAtraso)
    if (isNaN(this.posicionSlide)) {
      this.posicionSlide = 1;
    }
    console.log("posicionSlide " + this.posicionSlide)

    // Calculate 0-based index. Ensure it's not negative.
    // If we want the active day centered, we might offset.
    // But for now, let's just ensure the active day is visible.
    // Day 1 => Index 0. 
    // let targetIndex = Math.max(0, this.posicionSlide - 1);

    // this.slideOpts.initialSlide = targetIndex;
    this.updateRenderedWindow();
    /*this.slides.slideTo(this.imageIndex, 0).then(() => {
    setTimeout(() => {
    this.loading = false;
    }, 250);
    }); */

  } //fin ngOnIniT


  atras() {
    this.navCtrl.navigateBack('/tabs/plan-lectura');
  }


  addMMM(mes) {
    console.log(mes);
    for (let entry of this.meses) {
      if (entry.numero === mes) {
        return entry.mes;
      }
    }
  }

  async estadoPlan() {
    const totalDays = this.planOfStora.length;
    // Count actually completed days
    const completedDays = this.planOfStora.filter(entry => entry.statusDia).length;
    // Calculate percentage (0 to 1)
    const progress = totalDays > 0 ? (completedDays / totalDays) : 0;

    console.log(`Progreso Real: ${completedDays}/${totalDays} = ${progress}`);

    // Update Storage one time
    await this.updateGlobalProgress(progress);

    // Legacy Logic for "Atraso" (Delay) - Keeps tracking the "Next Pending Day"
    let diaT;
    for (let entry of this.planOfStora) {
      if (!entry.statusDia) {
        diaT = entry.dia;
        break;
      }
    }
    // If all done
    if (!diaT) diaT = totalDays;

    if (parseInt(this.diaLecturaV) >= parseInt(diaT)) {
      this.diaAtraso = parseInt(this.diaLecturaV) - parseInt(diaT);
      this.verDiaAtraso = this.diaAtraso > 0;
      console.log("dias de atraso " + this.diaAtraso);
    } else {
      this.verDiaAtraso = false;
    }
  }

  async updateGlobalProgress(progress: number) {
    await this.storage.get('planesActivos').then(async (val) => {
      let activePlans = val || [];

      const planIndex = activePlans.findIndex(p => p.nombre === this.nombrePlan);
      if (planIndex > -1) {
        activePlans[planIndex].progreso = progress;

        // Debug
        console.log(`Actualizando plan ${this.nombrePlan} a progreso ${progress}`);

        this.planesActivos = activePlans;
        await this.storage.set('planesActivos', this.planesActivos);
      }
    });
  }

  async iniciarPlan() {
    // Check for duplicates before adding
    const planExists = this.planesActivos.some(activePlan => activePlan.nombre === this.nombrePlan);

    if (!planExists) {
      for (let plan of this.planes) {
        if (plan.nombre === this.nombrePlan) {
          this.planesActivos.push({
            titulo: plan.titulo,
            nombre: plan.nombre,
            imagen: plan.imagen,
            descripcion: plan.descripcion,
            URI: plan.URI,
            diaInicio: this.dd,
            mesInicio: this.mm,
            anoInicio: this.yyyy,
            progreso: 0
          });
        }
      }
      await this.storage.set('planesActivos', this.planesActivos);
    }
    this.btnIniciarPlan = false;
    for (let dias of this.temporalPlan) {
      for (let detalle of dias.detalles) {
        this.pushLeerPlan(detalle.libro, detalle.capitulo, detalle.versiculo, detalle.versiculoFinal);
        break;
      }
      break;
    }
    this.storage.set(this.nombrePlan, this.temporalPlan);
  }


  statusSlide(dia) {
    if (Number(dia) == this.posicionSlide || Number(dia) == this.activarDia) {  //this.posicionSlide o this.dia
      return true;
    } else {
      return false;
    }

  }




  /////////////////////////////////////////////////////////////Verificar
  statusBadge(dia) {
    if (dia === this.diaLecturaV) {
      return true;
    } else {
      return false;
    }
  }

  pushLeerPlan(libro, capitulo, versiculo, versiculoFinal) {
    //this.navCtrl.navigateForward(`/leer-plan/${libro}/${capitulo}/${versiculo}/${versiculoFinal}`);
    this.router.navigate([`/leer-plan/${libro}/${capitulo}/${versiculo}/${versiculoFinal}`]);

  }

  async obtenerLibroCapitulos(dia, libro, detalles) {
    this.activarDia = dia
    // console.log(Object.keys(capitulos));
    this.dia = dia;
    await this.storage.set('diaPlan', this.dia);
    await this.storage.set('nombrePlan', this.nombrePlan);
    this.libro = libro;
    for (let entry of Libros) {
      if (libro === entry.id) {
        this.libroT = entry.libro;
      }
    }
    this.detallesDia = detalles;
    await this.storage.set('detalleDia', this.detallesDia);
    console.log(libro);
    console.log(detalles);
    this.verCapitulos = true;
  }

  obtenerNombreLibro(idLibro) {
    //return "El principio";
    for (let entry of Libros) {
      if (idLibro === entry.id) {
        return entry.libro;
        //this.libroT = entry.libro;
      }
    }
  }
  async statusCheckbox(dia, libro, capitulo) {
    // Note: HTML uses [(ngModel)], so the value is ALREADY updated when this runs.
    // Do NOT manually toggle it again, or you revert the user's action.

    // Find day with loose equality to handle string/number diffs
    const dayObj = this.planOfStora.find(d => d.dia == dia);
    console.log('DEBUG: statusCheckbox', { dia, libro, capitulo, found: !!dayObj });

    if (dayObj) {
      // Find the specific chapter detail
      // Note: Some plans might have string 'capitulo', others number. Use loose equality.
      const detail = dayObj.detalles.find(d => d.capitulo == capitulo);

      if (detail) {
        // detail.status is already updated via ngModel.
        console.log('DEBUG: New Status:', detail.status);
      }

      // Validate Day Completion
      const allDone = dayObj.detalles.every(d => d.status === true);
      dayObj.statusDia = allDone;

      // Save to SQLite
      // 1 = Completed, 0 = Incomplete
      const statusInt = allDone ? 1 : 0;
      await this.bibliaService.saveReadingProgress(this.nombrePlan, parseInt(dia), statusInt);

      this.estadoPlan();
    }
  }

  marcarDiasFaltantes(dia) {
    let diasListos = parseInt(this.diaLecturaV) - parseInt(this.diaAtraso)
    if (parseInt(dia) >= diasListos && parseInt(dia) < parseInt(this.diaLecturaV)) {
      return true
    } else {
      return false
    }
  }

  updateRenderedWindow() {
    if (!this.planOfStora) return;

    // Current global index (0-based)
    const currentIndex = Math.max(0, this.posicionSlide - 1);

    // Define Window: +/- 15 days, ensuring bounds
    const start = Math.max(0, currentIndex - 15);
    const end = Math.min(this.planOfStora.length, currentIndex + 15);

    this.renderedDays = this.planOfStora.slice(start, end);

    // The active day is now at index: currentIndex - start
    const relativeIndex = currentIndex - start;

    console.log(`Window update: Start ${start}, End ${end}, Relative Index ${relativeIndex}`);

    setTimeout(() => {
      if (this.swiperRef?.nativeElement?.swiper) {
        this.swiperRef.nativeElement.swiper.slideTo(relativeIndex, 0); // 0 speed for instant jump or 500 for smooth
      }
    }, 100);
  }

}
