import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // 👈 Importante: Adicionar Validators
import { ToastController, LoadingController } from '@ionic/angular';
import { lastValueFrom } from 'rxjs';
import { BarbeariaService } from 'src/app/services/barbearia';

@Component({
  selector: 'app-barbearia-acessibilidades',
  templateUrl: './barbearia-acessibilidades.page.html',
  styleUrls: ['./barbearia-acessibilidades.page.scss'],
  standalone: false
})
export class BarbeariaAcessibilidadesPage implements OnInit {

  formGroup!: FormGroup;
  caracteristicas: any[] = [];
  
  // Idealmente, deve vir do BarbeariaService.carregar().idBarbearia
  idBarbearia: number = 1; 

  constructor(
    private fb: FormBuilder,
    private barbeariaService: BarbeariaService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    const barbeariaLogada = this.barbeariaService.carregar();
    if (barbeariaLogada && barbeariaLogada.idBarbearia) {
        this.idBarbearia = barbeariaLogada.idBarbearia;
    }
}

  async ngOnInit() {
    await this.carregarCaracteristicasComRespostas();
  }

  /** * Busca todas as características disponíveis e combina com as respostas salvas. */
  async carregarCaracteristicasComRespostas() {
    const loading = await this.loadingCtrl.create({
      message: 'Carregando características...'
    });
    await loading.present();

    try {
      const todas = await lastValueFrom(this.barbeariaService.buscarCaracteristicas());
      const salvas = await lastValueFrom(this.barbeariaService.buscarCaracteristicasBarbearia(this.idBarbearia));

      const listaTodas = todas || [];
      const listaSalvas = salvas || [];

      this.caracteristicas = listaTodas.map((caract: any) => {
        const resposta = listaSalvas.find((r: any) => r.idCaracteristica === caract.idCaracteristica);
        
        // Armazena a resposta salva para uso na inicialização do formulário
        return {
          ...caract,
          respostaSalva: resposta
        };
      });

      // 4. Monta o form dinâmico com o valor salvo OU null (para forçar a seleção)
      this.formGroup = this.fb.group({});
      this.caracteristicas.forEach(c => {
        const valorInicial = c.respostaSalva ? String(c.respostaSalva.possui) : null;
        
        this.formGroup.addControl(
          'caracteristica_' + c.idCaracteristica,
          this.fb.control(valorInicial, Validators.required) // 👈 Agora é obrigatório
        );
      });

      await loading.dismiss();
    } catch (err) {
      console.error('Erro no carregamento:', err);
      await loading.dismiss();
      this.mostrarToast('Erro ao carregar as características.');
    }
  }

  /** Salva as respostas no backend */
  async salvarCaracteristicas() {
    // A validação agora é nativa (formGroup.valid é false se algum campo for null)
    if (!this.formGroup.valid) {
        this.mostrarToast('Por favor, responda todas as características.');
        return;
    }

    // Mapeia os dados do formulário
    const respostas = this.caracteristicas.map(c => {
        const valorString = this.formGroup.get('caracteristica_' + c.idCaracteristica)?.value;
        
        // Converte a string ("true"/"false") de volta para booleano
        const possui = valorString === "true";
        
        return {
            idBarbearia: this.idBarbearia,
            idCaracteristica: c.idCaracteristica,
            possui: possui
        };
    });

    const loading = await this.loadingCtrl.create({
      message: 'Salvando respostas...'
    });
    await loading.present();

    this.barbeariaService.salvarCaracteristicasBarbearia(respostas).subscribe({
      next: async () => {
        await loading.dismiss();
        this.mostrarToast('Características salvas com sucesso!');
      },
      error: async (err) => {
        console.error('Erro ao salvar:', err);
        await loading.dismiss();
        this.mostrarToast('Erro ao salvar características.');
      }
    });
  }

  /** Exibe um toast */
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