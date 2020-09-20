import { Component, NgZone, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { environment as env } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  fimBuscaDados: boolean;
  exibirProgressBar: boolean;
  resultados: string[] = [];
  resultadosObserver: Observable<string[]>;

  constructor(private ngZone: NgZone) { }

  ob: Observer<string[]>;

  ngOnInit(): void {
    this.resultadosObserver = this.criarEventSourceObserver();
  }

  criarEventSourceObserver(): Observable<string[]> {
    this.fimBuscaDados = false;

    return new Observable<string[]>((observer: Observer<string[]>) => {
      const source = new EventSource(env.apiPesquisarUrl);

      source.onmessage = (event) => {
        console.log(event.data);
        this.resultados.push(event.data);
        this.resultados.sort();
        this.ngZone.run(() => observer.next(this.resultados));
      };

      source.onopen = (event) => {
        if (this.fimBuscaDados) {
          source.close();
          this.ngZone.run(() => {
            observer.complete();
            this.exibirProgressBar = false;
          });
        }
        this.fimBuscaDados = true;
      };
    });
  }
}
