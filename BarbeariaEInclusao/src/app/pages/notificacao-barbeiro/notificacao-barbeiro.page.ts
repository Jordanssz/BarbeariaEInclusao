import { Component, OnInit } from '@angular/core';
import { SolicitacaoService } from 'src/app/services/solicitacao';
import { Solicitacao } from 'src/app/model/solicitacao';
import { ProfissionalService } from 'src/app/services/profissional';
import { BarbeariaService } from 'src/app/services/barbearia';
import { AlertController, ToastController } from '@ionic/angular';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface SolicitacaoDisplay extends Solicitacao {
  nomeBarbearia: string;
}

@Component({
  selector: 'app-notificacao-barbeiro',
  templateUrl: './notificacao-barbeiro.page.html',
  styleUrls: ['./notificacao-barbeiro.page.scss'],
  standalone: false
})
export class NotificacaoBarbeiroPage implements OnInit {

  solicitacoes: SolicitacaoDisplay[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  idBarbeiroLogado: number | null = null;

  constructor(
    private solicitacaoService: SolicitacaoService,
    private profissionalService: ProfissionalService,
    private barbeariaService: BarbeariaService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.carregarSolicitacoes();
  }

  carregarSolicitacoes() {
    this.isLoading = true;
    this.errorMessage = null;

    const barbeiro = this.profissionalService.getBarbeiroLogado();
    this.idBarbeiroLogado = barbeiro?.idBarbeiro || null;

    if (!this.idBarbeiroLogado) {
      this.errorMessage = 'Barbeiro não autenticado.';
      this.isLoading = false;
      return;
    }

    this.solicitacaoService.listarPorBarbeiro(this.idBarbeiroLogado).pipe(
      map(solicitacoes => {
        if (solicitacoes.length === 0) {
          this.errorMessage = 'Você não possui solicitações.';
          this.isLoading = false;
          return [];
        }

        const chamadas = solicitacoes.map(s => {
          const idRemetente = s.idBarbeariaRemetente;
          if (idRemetente == null) {
            // Se ID ausente, retorna um observable com fallback de nome
            return of({
              ...s,
              nomeBarbearia: `Barbearia ID ${idRemetente ?? '—'}`
            } as SolicitacaoDisplay);
          }

          return this.barbeariaService.buscarPorId(idRemetente as number).pipe(
            catchError(() => of(null)),
            map(barbearia => ({
              ...s,
              nomeBarbearia: barbearia?.nomeBarbearia || `Barbearia ID ${s.idBarbeariaRemetente}`
            }) as SolicitacaoDisplay)
          );
        });

        return forkJoin(chamadas);
      })
    ).subscribe({
      next: result$ => {
        if (Array.isArray(result$)) {
          this.solicitacoes = result$;
          this.isLoading = false;
        } else {
          result$.subscribe(lista => {
            this.solicitacoes = lista;
            this.isLoading = false;
          });
        }
      },
      error: () => {
        this.errorMessage = 'Erro ao carregar solicitações.';
        this.isLoading = false;
      }
    });
  }

  async confirmarAceite(solicitacao: SolicitacaoDisplay) {
    const alert = await this.alertController.create({
      header: 'Aceitar solicitação',
      message: `Deseja aceitar a solicitação da barbearia <b>${solicitacao.nomeBarbearia}</b>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Aceitar',
          handler: () => this.aceitar(solicitacao)

        }
      ]
    });

    await alert.present();
  }

  async confirmarRecusa(solicitacao: SolicitacaoDisplay) {
    const alert = await this.alertController.create({
      header: 'Recusar solicitação',
      message: `Deseja recusar a solicitação da barbearia <b>${solicitacao.nomeBarbearia}</b>?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Recusar',
          handler: () => this.recusar(solicitacao)
        }
      ]
    });

    await alert.present();
  }

  aceitar(solicitacao: SolicitacaoDisplay) {
  if (!this.idBarbeiroLogado) return;

  this.solicitacaoService
    .aceitarSolicitacao(solicitacao, this.idBarbeiroLogado)
    .subscribe(() => {
      this.solicitacoes = this.solicitacoes.filter(
        s => s.idSolicitacao !== solicitacao.idSolicitacao
      );
    });
}

  recusar(solicitacao: SolicitacaoDisplay) {
  if (!this.idBarbeiroLogado) return;

  this.solicitacaoService
    .recusarSolicitacao(solicitacao, this.idBarbeiroLogado)
    .subscribe(() => {
      this.solicitacoes = this.solicitacoes.filter(
        s => s.idSolicitacao !== solicitacao.idSolicitacao
      );
    });
}
}
