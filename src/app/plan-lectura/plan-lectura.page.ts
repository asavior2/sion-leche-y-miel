import { Component, OnInit, OnDestroy } from '@angular/core';
import planesFile from '../../assets/planesLectura.json';
import { HttpClient } from '@angular/common/http';
import { NavController } from '@ionic/angular';
import { Storage as IonicStorage } from '@ionic/storage-angular';
import { Console } from 'console';


@Component({
  selector: 'app-plan-lectura',
  templateUrl: './plan-lectura.page.html',
  styleUrls: ['./plan-lectura.page.scss'],

})
export class PlanLecturaPage implements OnInit, OnDestroy {

  //root = RegistroPage;

  capitulos: any[] = new Array;
  maestro: any[] = new Array;
  contadorCapitulo;
  tipoOrdenName;
  tipoOrdenMiPlan;
  tipoOrdenBuscarPlan;
  barProgreso;
  planes = planesFile;
  params: Object;
  pushPage: any;
  barDiaProgreso;
  planesActivos;

  constructor(private httpClient: HttpClient,
    private navCtrl: NavController,
    private storage: IonicStorage
  ) {
    console.log(planesFile);
    this.ngOnInit();
  }


  ionViewCanEnter() {
    this.ngOnInit();
  }
  ionViewWillEnter() {                                               // Este es para que refresque las variables del storag
    this.ngOnInit();
    this.recargar();
    console.log('ionViewWillEnter');

  }
  ionViewDidLoad() {
    this.ngOnInit();
    console.log('ionViewDidLoad');
  }


  pushPlanDetalleNav(nombre) {
    this.navCtrl.navigateForward(`/plan-detalle/${nombre}`);

  }

  async ngOnInit() {
    console.log('Validar si se carga al hacer atras');
    await this.storage.get('planesActivos').then((val) => {
      if (val != null) {
        this.planesActivos = val;
        this.tipoOrdenLibro('miPlanes');
      } else {
        this.tipoOrdenLibro('bucarPlanes');

      }
    });
  }

  ngOnDestroy() {
    // acciones de destrucción
  }

  async recargar() {
    await this.storage.get('planesActivos').then((val) => {
      if (val != null) {
        this.planesActivos = val;
        this.tipoOrdenLibro('miPlanes');
      } else {
        this.tipoOrdenLibro('bucarPlanes');

      }
    });
  }

  tipoOrdenLibro(orden: string) {
    // console.log(libro);
    if (orden === 'miPlanes') {
      this.tipoOrdenMiPlan = true;
      this.tipoOrdenBuscarPlan = false;
      this.tipoOrdenName = 'miPlanes';
    } else {
      this.tipoOrdenMiPlan = false;
      this.tipoOrdenBuscarPlan = true;
      this.tipoOrdenName = 'bucarPlanes';
    }
  }

  async filterListPlan(evt) {
    if (evt === 'limpiar') {
      this.planes = planesFile;
    } else {
      const searchTerm = evt.srcElement.value;
      if (!searchTerm) {
        return;
      }
      this.planes = this.planes.filter(planes => {
        if (planes.titulo && searchTerm) {
          return (this.getCleanedString(planes.titulo).toLowerCase().indexOf(this.getCleanedString(searchTerm).toLowerCase()) > -1);
        }
      });
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



  /*  1189 capitulos  365 dias   
      3 capitulos diarios 1095   
      94 dias 4 capitulos
      Total 1189
      desde 1 al 271 dias leer 3 capitulos 
      des de 272 a 365 leer 4 capitulos. 

      {dia:"1", capitulos}
      capitulos = {capitulo:"1", capitulo:"2, capitulo:"3"}
  */


}
