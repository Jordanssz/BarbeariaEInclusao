import { Component, OnInit } from '@angular/core';
import { Barbearia } from 'src/app/model/barbearia';
import { BarbeariaService } from 'src/app/services/barbearia';
import { ServicoService } from 'src/app/services/servico';
import { NavController, ToastController } from '@ionic/angular';
import { GeolocationService } from 'src/app/services/geolocationservice';
import { ProfissionalService } from 'src/app/services/profissional';
import { formatarEnderecoSimples } from 'src/app/app.component';
import { SolicitacaoService } from 'src/app/services/solicitacao';
import { Solicitacao } from 'src/app/model/solicitacao';
import { lastValueFrom } from 'rxjs'; // 👈 NOVO IMPORT para usar async/await
import { AvaliacaoService } from 'src/app/services/avaliacao';

@Component({
  selector: 'app-barbearia-menu',
  templateUrl: './barbearia-menu.page.html',
  styleUrls: ['./barbearia-menu.page.scss'],
  standalone: false
})
export class BarbeariaMenuPage implements OnInit {

  barbearia: Barbearia = new Barbearia();
  servicos: any[] = [];
  profissionais: any[] = [];
  avaliacaoMedia: number = 0;
  comentarios: any[] = [];
  public Math = Math;
  
  enderecoCompleto: string = 'Carregando localização...';
  
  // VARIÁVEL: Armazenará apenas os NOMES das características com 'possui: true'
  caracteristicasAcessiveis: string[] = [];

   readonly IMAGEM_SERVICO_PADRAO = 'assets/img/servico-placeholder.png';
  
  // Controla o estado de adição de profissional
  adicionandoProfissional: boolean = false;
  codigoProfissional: string = '';  constructor(
    private barbeariaService: BarbeariaService,
    private servicoService: ServicoService,
    private solicitacaoService: SolicitacaoService,
    private profissionalService: ProfissionalService,
    private navController: NavController,
    private toastController: ToastController,
    private geolocationService: GeolocationService,
    private avaliacaoService: AvaliacaoService
  ) {}

  carregarProfissionais(idBarbearia: number) {
  this.profissionalService.getBarbeirosByBarbearia(idBarbearia).subscribe({
    next: (profissionais) => {
      const lista = profissionais || [];
      this.profissionais = lista.map((p: any) => {
        const foto = p.fotoBarbeiro || p.fotoProfissional || p.foto || null;
        const nome = p.nomeBarbeiro || p.nomeProfissional || p.nome || p.apelido || '';
        const id = p.idBarbeiro || p.idProfissional || p.id || null;
        const funcao = p.funcao || p.cargo || null;

        let fotoNormalized = 'assets/avatar-placeholder.svg'; // Placeholder padrão

        if (foto) {
          if (foto.startsWith('data:')) {
            // Já é um Base64 com cabeçalho
            fotoNormalized = foto;
          } else if (foto.startsWith('/uploads/')) {
            // É um caminho de arquivo do servidor. 
            // Certifique-se de que o endereço do servidor (localhost:8080) está correto.
            fotoNormalized = `http://localhost:8080${foto}`;
          } else {
            // É uma string Base64 pura vinda do banco
            fotoNormalized = 'data:image/png;base64,' + foto.replace(/\s/g, '');
          }
        }

        return {
          idProfissional: id,
          nomeProfissional: nome,
          fotoProfissional: fotoNormalized,
          funcao: funcao
        };
      });
    },
    error: (err) => {
      console.error('Erro ao carregar profissionais:', err);
      this.profissionais = [];
    }
  });
}

  async removerProfissional(idProfissional: number | null | undefined) {
    if (!idProfissional) return;
    const confirm = window.confirm('Remover este profissional da barbearia?');
    if (!confirm) return;
    const idBarbearia = this.barbearia.idBarbearia;
    if (!idBarbearia) {
      this.exibirMensagem('Barbearia não identificada.');
      return;
    }

    // Chama o serviço de profissional para remover vínculo
    this.profissionalService.removerVinculoPorId(idProfissional, idBarbearia).subscribe({
      next: async () => {
        this.profissionais = this.profissionais.filter(p => p.idProfissional !== idProfissional);
        await this.exibirMensagem('Profissional removido da barbearia.');
      },
      error: async (err) => {
        console.error('Erro ao remover profissional:', err);
        await this.exibirMensagem('Erro ao remover profissional. Tente novamente.');
      }
    });
  }

  navegarParaAdicionarProfissional() {
    this.adicionandoProfissional = true;
    this.codigoProfissional = '';
  }

  confirmarAdicionarProfissional() {
  if (!this.codigoProfissional.trim()) {
    this.exibirMensagem('Por favor, insira um código do profissional.');
    return;
  }

  if (!this.barbearia.idBarbearia) {
    this.exibirMensagem('Erro: Barbearia não identificada.');
    return;
  }

  const idBarbeiro = Number(this.codigoProfissional.trim());
  if (isNaN(idBarbeiro) || idBarbeiro <= 0) {
    this.exibirMensagem('Código do profissional inválido.');
    return;
  }

  // Garante que `codigoProfissional` contenha o ID numérico do barbeiro antes de enviar
  this.codigoProfissional = String(idBarbeiro);

  // Monta o DTO esperado pelo controller: { codigoProfissional, idBarbeariaRemetente }
  const dto = {
    codigoProfissional: idBarbeiro,
    idBarbeariaRemetente: this.barbearia.idBarbearia!
  };

  this.solicitacaoService.criarComCodigo(dto).subscribe({
    next: () => {
      this.adicionandoProfissional = false;
      this.codigoProfissional = '';
      this.exibirMensagem('Solicitação enviada ao barbeiro!');
    },
    error: (err) => {
      console.error('Erro ao enviar solicitação:', err);
      this.exibirMensagem('Erro ao enviar solicitação.');
    }
  });
}


  cancelarAdicionarProfissional() {
    this.adicionandoProfissional = false;
    this.codigoProfissional = '';
  }

  ngOnInit() {
    this.barbeariaService.getBarbeariaLogada().subscribe({
      next: (barbearia) => {
        if (!barbearia || !barbearia.idBarbearia) {
          this.logout();
          return;
        }
        this.barbearia = barbearia;
        // 1. GARANTE A EXIBIÇÃO DA FOTO DE PERFIL (Base64)
        if (this.barbearia.fotoBarbearia && !this.barbearia.fotoBarbearia.startsWith('data:')) {
          this.barbearia.fotoBarbearia = 'data:image/png;base64,' + this.barbearia.fotoBarbearia;
        }
        // 2. CONVERTE COORDENADAS PARA ENDEREÇO
        this.converterCoordenadasParaEndereco(barbearia.latitude, barbearia.longitude);
        // Calcula média e carrega comentários para esta barbearia
        (async () => {
          try {
            this.avaliacaoMedia = await this.avaliacaoService.calcularMediaPorBarbearia(barbearia.idBarbearia!);
            this.comentarios = await this.avaliacaoService.listarComentariosPorBarbearia(barbearia.idBarbearia!);
          } catch (err) {
            console.error('Erro ao carregar avaliações:', err);
          }
        })();
        // Chama o carregamento de serviços e acessibilidades apenas se o ID existir
        this.carregarServicos(barbearia.idBarbearia);
        this.carregarAcessibilidades(barbearia.idBarbearia);
        // Carrega a lista de profissionais cadastrados (base pronta para futuro uso)
        this.carregarProfissionais(barbearia.idBarbearia);
      },
      error: (err) => {
        console.error('Erro ao carregar barbearia:', err);
        this.logout();
      }
    });
  }
  
  /**
   * Tenta extrair o nome da característica de diferentes estruturas (caminhos) possíveis do DTO.
   * @param c O objeto BarbeariaCaracteristica.
   * @returns O nome da característica como string ou null.
   */
  getCaracteristicaName(c: any): string | null {
      // 1. Tenta a propriedade original (c.nomeCaracteristica)
      if (c.nomeCaracteristica) {
          return c.nomeCaracteristica;
      }
      // 2. Tenta a propriedade aninhada comum em DTOs (c.caracteristica.nome)
      if (c.caracteristica && c.caracteristica.nome) {
          return c.caracteristica.nome;
      }
      // 3. Tenta a propriedade 'nome' no objeto principal (se o DTO foi "flatado")
      if (c.nome) {
          return c.nome;
      }
      // Se não encontrou o nome em nenhuma das propriedades esperadas
      return null;
  }

  /**
   * Busca todas as características marcadas como SIM para esta barbearia.
   * O filtro garante que apenas o nome da característica seja retornado para a lista.
   */
  async carregarAcessibilidades(idBarbearia: number) {
    try {
      const caracteristicasComResposta = await lastValueFrom(
        this.barbeariaService.buscarCaracteristicasBarbearia(idBarbearia)
      );
      
      console.log("Resposta do backend para acessibilidades:", caracteristicasComResposta);

      // --- NOVO LOG DE DEBUG CRÍTICO ---
      if (Array.isArray(caracteristicasComResposta) && caracteristicasComResposta.length > 0) {
          console.log("DEBUG: Estrutura do 1º item do array (JSON):", JSON.stringify(caracteristicasComResposta[0], null, 2));
      }
      // ---------------------------------

      // Logs de Debug Removidos, mas mantida a verificação essencial
      const caracteristicasAtivas: any[] = caracteristicasComResposta.filter((c: any) => c.possui === true);

      // Mapeia usando a nova função de extração de nome
      this.caracteristicasAcessiveis = caracteristicasAtivas
        .map((c: any) => this.getCaracteristicaName(c))
        .filter((nome: string | null): nome is string => !!nome && nome.trim().length > 0);
      
      console.log("Acessibilidades filtradas (tentativa multi-propriedade):", this.caracteristicasAcessiveis);
      
    } catch (error) {
      console.error('Erro ao carregar acessibilidades:', error);
      this.exibirMensagem('Erro ao carregar recursos de acessibilidade.');
      this.caracteristicasAcessiveis = [];
    }
  }


  /**
   * Converte a Latitude e Longitude da barbearia em um endereço legível usando o GeolocationService.
   */
  converterCoordenadasParaEndereco(lat: number | undefined, lon: number | undefined) {
    if (lat && lon) {
      this.geolocationService.getFormattedAddress(lat, lon).subscribe({
        next: (address) => {
          this.enderecoCompleto = address;
          // Garante que a função auxiliar exista antes de chamá-la
          if (typeof formatarEnderecoSimples === 'function') {
            this.enderecoCompleto = formatarEnderecoSimples(this.enderecoCompleto);
          } else {
            // Se a função não estiver disponível, usa a versão simples
            this.enderecoCompleto = this.getEnderecoSimples(this.enderecoCompleto);
          }
        },
        error: (err) => {
          this.enderecoCompleto = 'Erro ao obter endereço. Verifique as coordenadas.';
          console.error(err);
        }
      });
    } else {
      this.enderecoCompleto = 'Localização não cadastrada.';
    }
  }

    async excluirBarbearia() {
    // ATENÇÃO: Em aplicações Ionic/Angular, utilize AlertController para pop-ups de confirmação.
    // Vamos manter o window.confirm, mas AlertController é o padrão Ionic.
    const confirm = window.confirm('Tem certeza que deseja excluir sua barbearia? Esta ação não pode ser desfeita.');
    if (!confirm) return;

    // Acessando o ID com ! pois ngOnInit garante que ele existe
    this.barbeariaService.excluir(this.barbearia.idBarbearia!).subscribe({
      next: async () => {
        await this.exibirMensagem('Barbearia excluída com sucesso!');
        this.barbeariaService.encerrar();
        this.navController.navigateRoot('/inicio');
      },
      error: async (erro) => {
        console.error('Erro ao excluir barbearia:', erro);
        await this.exibirMensagem('Erro ao excluir. Tente novamente.');
      }
    });
  }

  async excluirServico(idServico: number) {
  // ATENÇÃO: Em aplicações Ionic/Angular, utilize AlertController para pop-ups de confirmação.
  const confirm = window.confirm('Tem certeza que deseja excluir este serviço?');
  if (!confirm) return;

  this.servicoService.excluir(idServico).subscribe({
    next: async () => {
      await this.exibirMensagem('Serviço excluído com sucesso!');
      // Atualiza a lista de serviços depois da exclusão
      this.carregarServicos(this.barbearia.idBarbearia!);
    },
    error: async (err) => {
      console.error('Erro ao excluir serviço:', err);
      await this.exibirMensagem('Erro ao excluir serviço. Tente novamente.');
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

  carregarServicos(idBarbearia: number) {
    this.servicoService.listarPorBarbearia(idBarbearia).subscribe({
      next: (servicos) => {
        this.servicos = servicos.map(servico => ({
          ...servico,
          fotoServico: this.normalizarImagemServico(servico.fotoServico)
        }));
      },
      error: (err) => {
        console.error('Erro ao carregar serviços:', err);
        this.servicos = [];
      }
    });
  }

  normalizarImagemServico(foto?: string | null): string {
    if (!foto || foto.trim().length === 0) {
      return this.IMAGEM_SERVICO_PADRAO;
    }

    if (foto.startsWith('data:')) {
      return foto;
    }

    return 'data:image/png;base64,' + foto.replace(/\s/g, '');
  }

  getStarIcon(star: number): string {
    const halfStars = Math.round(this.avaliacaoMedia || 0);
    const full = Math.floor(halfStars / 2);
    const half = halfStars % 2;
    if (star <= full) return 'star';
    if (star === full + 1 && half === 1) return 'star-half';
    return 'star-outline';
  }

getEnderecoSimples(enderecoCompleto: string): string {
  if (!enderecoCompleto) {
    return 'Endereço não definido';
  }
  
  // 1. Divide a string por vírgula
  const partes = enderecoCompleto.split(',');
  
  // 2. Tenta extrair as 4 primeiras partes (Rua, Bairro, Cidade e possivelmente algo mais)
  const partesRelevantes = partes.slice(0, 4);
  
  // 3. Remove excesso de espaços e junta novamente
  return partesRelevantes
    .map(p => p.trim())
    .join(', ');
}

  logout() {
    this.barbeariaService.encerrar();
    this.navController.navigateRoot('/login-barbearia');
  }
}
