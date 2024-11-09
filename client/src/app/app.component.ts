import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Observable, Subject, of } from 'rxjs';
import { CommonModule } from '@angular/common';

// Interfaz de Empleado que define la estructura de los datos del empleado
interface Empleado {
  nombre: string;
  email: string;
  edad: number;
  direccion: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],  // Importa el módulo común de Angular para directivas como *ngIf y *ngFor
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  // Creamos un Subject que actuará como un emisor de eventos de búsqueda
  private searchSubject = new Subject<string>();

  // Observable que contiene los resultados de la búsqueda, inicializado con un array vacío
  results$: Observable<Empleado[]> = of([]);

  // Variable que indica si se está realizando una búsqueda
  loading = false;

  // Mensaje de error que se mostrará si ocurre un problema durante la búsqueda
  errorMessage: string | null = null;

  constructor(private http: HttpClient) {
    // Configuración del flujo reactivo para realizar la búsqueda con debounce
    this.results$ = this.searchSubject.pipe(
      debounceTime(300),  // Espera 300ms después del último cambio en el input antes de hacer la petición
      distinctUntilChanged(),  // Solo emite el valor si ha cambiado respecto al valor anterior
      switchMap(query => {
        if (!query) {
          // Si el input está vacío, detenemos la búsqueda y mostramos un array vacío
          this.loading = false;  // Desactivamos el indicador de carga
          this.errorMessage = null;  // Restablecemos cualquier mensaje de error
          return of([]);  // Retorna un array vacío en lugar de hacer una solicitud
        }
        this.loading = true;  // Indicamos que estamos realizando la búsqueda
        return this.search(query).pipe(  // Llamamos a la función search() para hacer la petición
          catchError(error => {
            // Si ocurre un error en la petición, mostramos el mensaje de error y retornamos un array vacío
            this.loading = false;  // Desactivamos el indicador de carga
            this.errorMessage = 'Hubo un error al realizar la búsqueda.';  // Mostramos el mensaje de error
            return of([]);  // Retornamos un array vacío en caso de error
          })
        );
      })
    );
  }

  // Método que se ejecuta cuando el usuario escribe en el input de búsqueda
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;  // Obtenemos el valor del input de búsqueda
    this.searchSubject.next(input.value || '');  // Emitimos el valor de búsqueda al Subject
  }

  // Función que realiza la petición HTTP POST al servidor para obtener los empleados
  search(query: string): Observable<Empleado[]> {
    console.log('Haciendo petición a la API con el query:', query);  // Log para verificar que se realiza la búsqueda
    return this.http.post<Empleado[]>('http://localhost:5000/search', { query });  // Realiza la solicitud POST al backend
  }
}
