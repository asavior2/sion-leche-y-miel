import { Component, OnInit } from '@angular/core';
// import bibleOneYear from '../../assets/bibleOneYear.json';
import planesFile from '../../assets/planesLectura.json';
import { ActivatedRoute } from '@angular/router';
import Libros from '../../assets/libros.json';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Console } from 'console';
import { Router } from "@angular/router";

@Component({
  selector: 'app-plan-detalle',
  templateUrl: './plan-detalle.page.html',
  styleUrls: ['./plan-detalle.page.scss'],
})
export class PlanDetallePage implements OnInit {

  bibleOneYear;
  planOfStora;
  temporalPlan;
  planes = planesFile;
  slideOpts = {
    slidesPerView: 6,
    initialSlide: 0,
    speed: 400
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
  planesActivos:Array<any> = new Array();
  btnIniciarPlan =  true;
  yearValues = 2020;
  fecha = new Date();
  dd; mm; yyyy;
  mmS;
  ddStora; mmStora; yyyyStora;
  fechaHoy;
  diaLecturaV;
  meses = [
    {numero:1,mes:"ENE", cantidad:31},
    {numero:2,mes:"FEB", cantidad:28},
    {numero:3,mes:"MAR", cantidad:31},
    {numero:4,mes:"ABR", cantidad:30},
    {numero:5,mes:"MAY", cantidad:31},
    {numero:6,mes:"JUN", cantidad:30},
    {numero:7,mes:"JUL", cantidad:31},
    {numero:8,mes:"AGO", cantidad:31},
    {numero:9,mes:"SEP", cantidad:30},
    {numero:10,mes:"OCT", cantidad:31},
    {numero:11,mes:"NOV", cantidad:30},
    {numero:12,mes:"DIC", cantidad:31}
   ];
   verBadge = false;
   diaAtraso;
   verDiaAtraso;
   planArrayTemp: Array<any> = new Array();
   diaFinPlan;



  constructor(
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private storage: Storage,
    private router: Router
  ) {
    
   }
   ionViewWillEnter() {                           // Este es para que refresque las variables del storag
    this.ngOnInit();
  }
  ionViewDidLoad() {
    this.ngOnInit();
  }

  ionViewCanEnter() {
    this.ngOnInit();
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
        this.temporalPlan = require(`../../assets/planes/${entry.nombre}.json`);
        // console.log(this.bibleOneYear);

      }
    }
    // this.storage.remove('bibleOneYear');
    await this.storage.get('planesActivos').then((val) => {
      if (val === null) {
        this.btnIniciarPlan = true;
      } else {
        for (let entry of val) {
          this.planesActivos = [];
          this.planesActivos.push(entry);
          if (entry.nombre === this.nombrePlan) {
            console.log ('Desde  if dentre del planes activo ');
            this.btnIniciarPlan = false;
            console.log ('this.btnIniciarPlan ' + this.btnIniciarPlan);
            this.ddStora = entry.diaInicio;
            this.mmStora = entry.mesInicio;
            this.yyyyStora = entry.anoInicio;
          }
        }
        //this.bibleOneYearStora = val;
      }
    });

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

    for (let dia of this.planOfStora) {
      console.log('dia de lectura ' + this.diaLecturaV);
      if (dia.dia === this.diaLecturaV) {
        console.log(' Dentro del IF Va en el dia ' + dia.dia);
        this.slideOpts.initialSlide = dia.dia - 4;
        this.obtenerLibroCapitulos(dia.dia, dia.libro, dia.detalles);
        this.statusSlide(dia.dia);
        this.marcarSlite = true;
        this.verBadge = true;
      }
     
    }
    this.estadoPlan();

    this.diaFinPlan = this.planOfStora.length;

  } //fin ngOnIniT

  atras() {
  // this.navCtrl.pop();
    this.navCtrl.navigateRoot(['/tabs/plan-lectura']);
   // this.navCtrl.navigateForward('/tabs/plan-lectura');
   this.router.navigate(["/tabs/plan-lectura"]);
  }


  addMMM(mes) {
    console.log(mes);
    for (let entry of this.meses) {
      if (entry.numero === mes) {
        return entry.mes;
      }
    }
  }

  estadoPlan() {
    let diaT;
    for (let entry of this.planOfStora) {
      if (!entry.statusDia) {
        diaT = entry.dia;
        this.updatePlanActual(diaT);
        break;
        break;
      }
    }
    if (parseInt(this.diaLecturaV) >= parseInt(diaT)) {
      this.diaAtraso = parseInt(this.diaLecturaV) - parseInt(diaT);
      if (this.diaAtraso === 0) {
        this.verDiaAtraso = false;
      } else  {
        this.verDiaAtraso = true;
      }
      console.log ("dias de atraso " + this.diaAtraso);
    }
  }

  async updatePlanActual(dia) {
    await this.storage.get('planesActivos').then((val) => {
      if (val !== null) {
          this.planesActivos = val;
        }
    });
    
    this.planArrayTemp = [];
    let progresoUpdate;
    // console.log('ver  planArrayTemp 00000************');
    // console.log(this.planArrayTemp);
    if (this.planesActivos.length !== 0) {
      
      // console.log ('ver************');
      // console.log(this.planesActivos);
      for (let planActivo of  this.planesActivos) {
        if (planActivo.nombre === this.nombrePlan) {
          progresoUpdate = ((100 * parseInt(dia)) / 365) / 100;
          this.planArrayTemp.push(
            {titulo: planActivo.titulo,
              nombre: planActivo.nombre,
              imagen: planActivo.imagen,
              descripcion: planActivo.descripcion,
              URI: planActivo.URI,
              diaInicio: planActivo.diaInicio,
              mesInicio: planActivo.mesInicio,                   //this.mm,
              anoInicio: planActivo.anoInicio,
              progreso: progresoUpdate});
        } else {
          // this.planArrayTemp.push(planActivo);
          this.planArrayTemp.push(
            {titulo: planActivo.titulo,
              nombre: planActivo.nombre,
              imagen: planActivo.imagen,
              descripcion: planActivo.descripcion,
              URI: planActivo.URI,
              diaInicio: planActivo.diaInicio,
              mesInicio: planActivo.mesInicio,                   //this.mm,
              anoInicio: planActivo.anoInicio,
              progreso: planActivo.progreso});

        }
      }
      this.planesActivos = [];
      this.planesActivos = this.planArrayTemp;
      // await this.storage.remove('planesActivos');
      await this.storage.set('planesActivos', this.planesActivos);
      // console.log ('ver 2  planArrayTemp ************');
      // console.log(this.planArrayTemp);
      // console.log ('ver 2  planesActivos ************');
      // console.log(this.planesActivos);
      
      
    }
  }

  iniciarPlan() {
    for (let plan of this.planes) {
      if (plan.nombre === this.nombrePlan) {
        this.planesActivos.push(
          {titulo: plan.titulo,
            nombre: plan.nombre,
            imagen: plan.imagen,
            descripcion: plan.descripcion,
            URI:plan.URI,
            diaInicio: this.dd,  // 
            mesInicio: this.mm,                   //this.mm
            anoInicio: this.yyyy,
            progreso: 0});
        // this.planesActivos.push(plan);
      }
    }
    this.storage.set('planesActivos', this.planesActivos);
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
    if (dia === this.dia) {
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

  pushLeerPlan(libro, capitulo, versiculo,versiculoFinal) {
    this.navCtrl.navigateForward(`/leer-plan/${libro}/${capitulo}/${versiculo}/${versiculoFinal}`);
  }

  obtenerLibroCapitulos(dia, libro, detalles) {
    // console.log(Object.keys(capitulos));
    this.dia = dia;
    this.storage.set('diaPlan', this.dia);
    this.storage.set('nombrePlan', this.nombrePlan);
    this.libro = libro;
    for (let entry of Libros) {
      if (libro === entry.id) {
        this.libroT = entry.libro;
      }
    }
    this.detallesDia = detalles;
    this.storage.set('detalleDia', this.detallesDia);
    console.log(libro);
    console.log(detalles);
    this.verCapitulos = true;
  }

  obtenerNombreLibro(idLibro){
    //return "El principio";
    for (let entry of Libros) {
      if (idLibro === entry.id) {
        return entry.libro;
        //this.libroT = entry.libro;
      }
    }
  }
  statusCheckbox(dia, libro, capitulo) {                // CONTROLA la marca de capitulos leidos
    console.log("dia " + dia + libro, capitulo);
    let tempoDia:Array<any> = new Array();
    let tempoDetalle:Array<any> = new Array();
    let statusDia:Array<any> = new Array();          // Se creo para identifical algun check desmarcado
    let statusDiaBoleano = true;
    for (let dias of this.planOfStora) {
      if (dias.dia === dia && dias.libro === libro) {
        for (let detalle of dias.detalles) {
          if (detalle.capitulo === capitulo) {
            if (detalle.status === true) {
              tempoDetalle.push({libro: detalle.libro, capitulo: detalle.capitulo, status: false, versiculo: detalle.versiculo, versiculoFinal: detalle.versiculoFinal});
              statusDia.push(false);
            } else {
              tempoDetalle.push({libro: detalle.libro, capitulo: detalle.capitulo, status: true,versiculo: detalle.versiculo, versiculoFinal: detalle.versiculoFinal});
              statusDia.push(true);
            }
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
    this.storage.set(this.nombrePlan, this.planOfStora);
    this.estadoPlan();
  }

}
