import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Servico } from 'src/app/model/servico';
import { ServicoService } from 'src/app/services/servico';
import { BarbeariaService } from 'src/app/services/barbearia';
import { ProfissionalService } from 'src/app/services/profissional';

@Component({
  selector: 'app-add-servico',
  templateUrl: './add-servico.page.html',
  styleUrls: ['./add-servico.page.scss'],
  standalone: false
})
export class AddServicoPage implements OnInit {

  servico: Servico;
  formGroup: FormGroup;
  editando: boolean = false; // Flag para identificar se é edição
  adicionandoProfissional: boolean = false; // Propriedade adicionada para evitar erros no template

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private activatedRoute: ActivatedRoute,
    private navController: NavController,
    private servicoService: ServicoService,
    private barbeariaService: BarbeariaService,
    private profissionalService: ProfissionalService
  ) {
    this.servico = new Servico();

    this.formGroup = this.formBuilder.group({
      'nomeServico': [this.servico.nomeServico, Validators.compose([Validators.required])],
      'precoServico': [this.servico.precoServico, Validators.compose([Validators.required])],
      'descricaoServico': [this.servico.descricaoServico, Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    const id = this.activatedRoute.snapshot.params['id']; // Obtém o ID da rota
    if (id) {
      this.editando = true; // Ativa o modo de edição
      this.carregarServico(id);
    }
  }

  carregarServico(id: number) {
    this.servicoService.buscarPorId(id).subscribe({
      next: (servico) => {
        this.servico = servico;
        this.formGroup.patchValue({
          nomeServico: servico.nomeServico,
          precoServico: servico.precoServico,
          descricaoServico: servico.descricaoServico
        });
      },
      error: (err) => {
        this.exibirMensagem('Erro ao carregar serviço.');
        console.error(err);
      }
    });
  }

  salvarServico() {
    if (!this.formGroup.valid) {
      this.exibirMensagem('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Preenche os dados do formulário
    this.servico.nomeServico = this.formGroup.value.nomeServico;
    this.servico.precoServico = parseFloat(this.formGroup.value.precoServico);
    this.servico.descricaoServico = this.formGroup.value.descricaoServico;
  
    // Obtém dados da barbearia logada
    const barbearia = this.barbeariaService.carregar();
    if (!barbearia || !barbearia.idBarbearia) {
      this.exibirMensagem('Erro: Barbearia não encontrada. Faça login novamente.');
      this.navController.navigateRoot('/login-barbearia');
      return;
    }

    // 💡 LOG E VALIDAÇÃO APRIMORADA
    console.log('ID da Barbearia logada:', barbearia.idBarbearia);
    
    // Validação estrita para garantir que o ID é um número positivo (válido para FK)
    if (typeof barbearia.idBarbearia !== 'number' || barbearia.idBarbearia <= 0) {
        this.exibirMensagem('Erro: O ID da Barbearia carregada é inválido ou 0. Faça login novamente.');
        console.error('ID da Barbearia logada é inválido ou 0:', barbearia.idBarbearia);
        this.navController.navigateRoot('/login-barbearia');
        return;
    }

    // Configura o ID da barbearia (usa a nomenclatura EXATA do modelo Java: idBarbeariaServico)
    this.servico.idBarbeariaServico = barbearia.idBarbearia;

    // Busca barbeiros existentes na barbearia e escolhe o primeiro disponível como barbeiro do serviço.
    // Se a busca falhar ou não houver barbeiros, usa placeholder 1 e registra aviso.
    this.profissionalService.getBarbeirosByBarbearia(barbearia.idBarbearia).subscribe({
      next: (barbeiros) => {
        if (barbeiros && barbeiros.length > 0 && barbeiros[0].idBarbeiro) {
          this.servico.idBarbeiroServico = barbeiros[0].idBarbeiro;
        } else {
          // 🛑 ATENÇÃO: Se 'idBarbeiroServico' é uma FK obrigatória, 
          // é crucial que o ID 1 exista na tabela de barbeiros (profissional).
          this.servico.idBarbeiroServico = 1; // placeholder
          console.warn('Nenhum barbeiro encontrado para a barbearia — usando placeholder idBarbeiroServico=1');
        }

        // Valida o preço
        if (this.servico.precoServico <= 0) {
          this.exibirMensagem('O preço deve ser maior que zero.');
          return;
        }

        console.log('Serviço enviado:', this.servico);

        const executarSalvar = () => {
          if (this.editando) {
            this.servicoService.atualizar(this.servico).subscribe({
              next: () => {
                this.exibirMensagem('Serviço atualizado com sucesso!');
                this.navController.navigateBack('/barbearia-menu');
              },
              error: (err) => {
                this.exibirMensagem('Erro ao atualizar serviço. Veja console para detalhes.');
                console.error('Erro atualizar servico:', err);
                if (err && err.error) console.error('Erro body:', err.error);
                if (err && err.status) console.error('Erro status:', err.status);
              }
            });
          } else {
            this.servicoService.salvar(this.servico).subscribe({
              next: () => {
                this.exibirMensagem('Serviço salvo com sucesso!');
                this.navController.navigateBack('/barbearia-menu');
              },
              error: (err) => {
                this.exibirMensagem('Erro ao salvar serviço. Veja console para detalhes.');
                console.error('Erro salvar servico:', err);
                if (err && err.error) console.error('Erro body:', err.error);
                if (err && err.status) console.error('Erro status:', err.status);
              }
            });
          }
        };

        executarSalvar();
      },
      error: (e) => {
        console.error('Erro ao buscar barbeiros da barbearia:', e);
        // fallback para placeholder
        this.servico.idBarbeiroServico = 1;

        // Valida o preço
        if (this.servico.precoServico <= 0) {
          this.exibirMensagem('O preço deve ser maior que zero.');
          return;
        }

        console.warn('Usando placeholder idBarbeiroServico=1 por erro na busca de barbeiros.');
        console.log('Serviço enviado (fallback):', this.servico);

        // tenta salvar mesmo com fallback
        if (this.editando) {
          this.servicoService.atualizar(this.servico).subscribe({
            next: () => {
              this.exibirMensagem('Serviço atualizado com sucesso!');
              this.navController.navigateBack('/barbearia-menu');
            },
            error: (err) => {
              this.exibirMensagem('Erro ao atualizar serviço. Veja console para detalhes.');
              console.error('Erro atualizar servico:', err);
            }
          });
        } else {
          this.servicoService.salvar(this.servico).subscribe({
            next: () => {
              this.exibirMensagem('Serviço salvo com sucesso!');
              this.navController.navigateBack('/barbearia-menu');
            },
            error: (err) => {
              this.exibirMensagem('Erro ao salvar serviço. Veja console para detalhes.');
              console.error('Erro salvar servico:', err);
            }
          });
        }
      }
    });
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present();
  }
}
