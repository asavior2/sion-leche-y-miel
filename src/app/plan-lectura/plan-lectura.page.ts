import { Component, OnInit } from '@angular/core';
import plan from '../../assets/planLectura.json';


@Component({
  selector: 'app-plan-lectura',
  templateUrl: './plan-lectura.page.html',
  styleUrls: ['./plan-lectura.page.scss'],
})
export class PlanLecturaPage implements OnInit {

  capitulos: any[] = new Array;
  maestro:any[] = new Array;
  contadorCapitulo;

  constructor() { 
    
   /* for (let entry of Libros){
      this.contadorCapitulo = entry.capitulos;
      for(let _i = 0; _i < parseInt(entry.capitulos); _i++){
        if (this.contadorCapitulo <= entry.capitulos){

        }
      }
    }
    for (let _i = 0; _i < 271; _i++) {
      this.capitulos.push({capitulo1:"1",
                          capitulo2:"2",
                          capitulo3:"3"
                          });
      this.maestro.push({dia:"1",
                        capitulos:this.capitulos
                        });
    }*/

  
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
  ngOnInit() {
  }

}
