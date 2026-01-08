import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController, NavController } from '@ionic/angular';
import { AvaliacaoService } from 'src/app/services/avaliacao';
import { Avaliacao } from 'src/app/model/avaliacao';

@Component({
  selector: 'app-avaliacao',
  templateUrl: './avaliacao.page.html',
  styleUrls: ['./avaliacao.page.scss'],
  standalone: false
})
export class AvaliacaoPage implements OnInit {

  idAtendimento: number | null = null;
  nota: number = 5;
  comentario: string = '';
  enviando: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private avaliacaoService: AvaliacaoService,
    private toastController: ToastController,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    const idStr = this.route.snapshot.queryParamMap.get('id');
    this.idAtendimento = idStr ? Number(idStr) : null;
  }

  selecionarNota(n: number) {
    this.nota = n;
  }

  async enviarAvaliacao() {
    if (!this.idAtendimento) {
      const t = await this.toastController.create({ message: 'Atendimento inválido.', duration: 1500, color: 'danger' });
      await t.present();
      return;
    }

    this.enviando = true;
    const avaliacao = new Avaliacao();
    avaliacao.idAvaliacao = 0;
    avaliacao.nota = this.nota;
    avaliacao.comentario = this.comentario || '';
    avaliacao.idAtendimentoAvaliacao = this.idAtendimento!;

    this.avaliacaoService.create(avaliacao).subscribe({
      next: async () => {
        this.enviando = false;
        const t = await this.toastController.create({ message: 'Avaliação enviada. Obrigado!', duration: 1600, color: 'success' });
        await t.present();
        this.navCtrl.navigateBack(['/atendimentos-marcados']);
      },
      error: async (err) => {
        console.error('Erro ao enviar avaliação:', err);
        this.enviando = false;
        const t = await this.toastController.create({ message: 'Erro ao enviar avaliação.', duration: 2000, color: 'danger' });
        await t.present();
      }
    });
  }

}
