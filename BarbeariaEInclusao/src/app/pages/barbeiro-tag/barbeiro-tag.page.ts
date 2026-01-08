import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, LoadingController } from '@ionic/angular';
import { lastValueFrom } from 'rxjs';
import { ProfissionalService } from 'src/app/services/profissional'; // serviço do barbeiro
import { TagService } from 'src/app/services/tag'; // novo serviço para tags

@Component({
  selector: 'app-barbeiro-tag',
  templateUrl: './barbeiro-tag.page.html',
  styleUrls: ['./barbeiro-tag.page.scss'],
  standalone: false
})
export class BarbeiroTagPage implements OnInit {

  formGroup!: FormGroup;
  tags: any[] = [];
  idBarbeiro!: number;

  constructor(
    private fb: FormBuilder,
    private profissionalService: ProfissionalService,
    private tagService: TagService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    const barbeiroLogado = this.profissionalService.getBarbeiroLogado();
    if (barbeiroLogado && barbeiroLogado.idBarbeiro) {
      this.idBarbeiro = barbeiroLogado.idBarbeiro;
    }
  }

  async ngOnInit() {
    await this.carregarTagsComRespostas();
  }

  /** Busca todas as tags e combina com as respostas do barbeiro */
  async carregarTagsComRespostas() {
    const loading = await this.loadingCtrl.create({
      message: 'Carregando tags...'
    });
    await loading.present();

    try {
      const todas = await lastValueFrom(this.tagService.buscarTags());
      const salvas = await lastValueFrom(this.profissionalService.buscarTagsBarbeiro(this.idBarbeiro));

      this.tags = todas.map((tag: any) => {
        const resposta = salvas.find((r: any) => r.idTag === tag.idTag);
        return {
          ...tag,
          respostaSalva: resposta
        };
      });

      // Monta o form dinâmico
      this.formGroup = this.fb.group({});
      this.tags.forEach(t => {
        const valorInicial = t.respostaSalva ? String(t.respostaSalva.possui) : null;
        this.formGroup.addControl('tag_' + t.idTag, this.fb.control(valorInicial, Validators.required));
      });

      await loading.dismiss();
    } catch (err) {
      console.error('Erro ao carregar tags:', err);
      await loading.dismiss();
      this.mostrarToast('Erro ao carregar as tags.');
    }
  }

  /** Salva as tags no backend */
  async salvarTags() {
    if (!this.formGroup.valid) {
      this.mostrarToast('Por favor, selecione todas as tags.');
      return;
    }

    const respostas = this.tags.map(t => {
      const valorString = this.formGroup.get('tag_' + t.idTag)?.value;
      const possui = valorString === "true";
      return {
        idBarbeiro: this.idBarbeiro,
        idTag: t.idTag,
        possui: possui
      };
    });

    const loading = await this.loadingCtrl.create({
      message: 'Salvando tags...'
    });
    await loading.present();

    this.tagService.salvarTagsBarbeiro(respostas).subscribe({
      next: async () => {
        await loading.dismiss();
        this.mostrarToast('Tags salvas com sucesso!');
      },
      error: async (err) => {
        console.error('Erro ao salvar:', err);
        await loading.dismiss();
        this.mostrarToast('Erro ao salvar tags.');
      }
    });
  }

  private async mostrarToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2500,
      position: 'bottom',
      color: 'light'
    });
    toast.present();
  }
}
