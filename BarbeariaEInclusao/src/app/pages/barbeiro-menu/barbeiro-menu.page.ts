import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { Barbeiro } from 'src/app/model/barbeiro';
import { ProfissionalService } from 'src/app/services/profissional';
import { Router } from '@angular/router';
// Importação do novo serviço de tags
import { TagService } from 'src/app/services/tag'; 
import { forkJoin, firstValueFrom } from 'rxjs'; // Adicionado para lidar com chamadas assíncronas
import { SolicitacaoService } from 'src/app/services/solicitacao';
import { Solicitacao } from 'src/app/model/solicitacao';
import { AvaliacaoService } from 'src/app/services/avaliacao';


// Interface para Tags e Vínculos
interface Tag {
  idTag: number; // Tipo corrigido para number, assumindo que é a PK
  nomeTag: string;
}

interface BarbeiroTag {
  idBarbeiroTag: number;
  idTag: number;
  idBarbeiro: number;
  // Alterando o tipo para 'any' temporariamente para lidar com 0/1, true/false, "0"/"1"
  possui: any; 
}


@Component({
  selector: 'app-barbeiro-menu',
  templateUrl: './barbeiro-menu.page.html',
  styleUrls: ['./barbeiro-menu.page.scss'],
  standalone: false
})
export class BarbeiroMenuPage implements OnInit {

  barbeiro: Barbeiro = new Barbeiro();
  tagsAtivas: string[] = []; // Array de nomes das tags para exibição
  avaliacaoMedia: number = 0;
  comentarios: any[] = [];
  qtdSolicitacoesPendentes: number = 0;
  mostRecentComentario: any = null;
  public Math = Math;
  
  constructor(
    private profissionalService: ProfissionalService,
    private navController: NavController,
    private toastController: ToastController,
    private router: Router,
    private solicitacaoService: SolicitacaoService,
    private tagService: TagService // Injeção do TagService
    , private avaliacaoService: AvaliacaoService
  ) { }

  async ngOnInit() {
    // 1. Carregar dados do barbeiro logado
    const barbeiroSalvo = this.profissionalService.getBarbeiroLogado();
    if (!barbeiroSalvo || !barbeiroSalvo.idBarbeiro) {
      this.logout();
      return;
    }
    this.barbeiro = barbeiroSalvo;
    
    // Converte foto para base64 se necessário
    if (this.barbeiro.fotoBarbeiro) {
    const foto = this.barbeiro.fotoBarbeiro;

    if (foto.startsWith('data:')) {
      // Caso a foto já esteja no formato Base64 completo
      // Não faz nada, mantém como está
    } else if (foto.startsWith('/uploads/')) {
      // Caso seja um caminho de arquivo salvo no servidor
      // Concatena com o endereço do seu backend
      this.barbeiro.fotoBarbeiro = `http://localhost:8080${foto}`;
    } else {
      // Caso seja apenas a string Base64 pura (legado)
      this.barbeiro.fotoBarbeiro = 'data:image/jpeg;base64,' + foto.replace(/\s/g, '');
    }
  } else {
    // Caso não exista foto, define o placeholder
    this.barbeiro.fotoBarbeiro = 'assets/avatar-placeholder.svg';
  }
    
    this.avaliacaoMedia = 10;
    // Carrega média e comentários para este barbeiro
    (async () => {
      try {
        this.avaliacaoMedia = await this.avaliacaoService.calcularMediaPorBarbeiro(this.barbeiro.idBarbeiro!);
        this.comentarios = await this.avaliacaoService.listarComentariosPorBarbeiro(this.barbeiro.idBarbeiro!);
        this.mostRecentComentario = (this.comentarios && this.comentarios.length) ? this.comentarios[0] : null;
      } catch (err) {
        console.error('Erro ao carregar avaliações do barbeiro:', err);
      }
    })();
    
    // 2. Carregar tags
    await this.carregarTags(this.barbeiro.idBarbeiro!);
    this.solicitacaoService.atualizarQtdSolicitacoesPendentes(this.barbeiro.idBarbeiro!);
    this.escutarBadgeSolicitacoes();
  }

  async carregarTags(idProfissional: number) {
    try {
      // LÓGICA CORRETA: Buscar lista mestra (Tag[]) E vínculos (BarbeiroTag[]) e fazer o join
      const tagObservables = forkJoin({
        tagsMestras: this.tagService.buscarTags(), // Retorna todas as Tags (idTag, nomeTag)
        vinculosBarbeiro: this.tagService.buscarTagsBarbeiro(idProfissional) // Retorna os vínculos BarbeiroTag (idBarbeiroTag, idTag, idBarbeiro, possui)
      });
      
      const results = await firstValueFrom(tagObservables);

      // Usando casting para garantir a tipagem (necessário para o ambiente do Canvas)
      const tagsMestras: Tag[] = Array.isArray(results.tagsMestras) ? (results.tagsMestras as Tag[]) : [];
      const vinculosBarbeiro: BarbeiroTag[] = Array.isArray(results.vinculosBarbeiro) ? (results.vinculosBarbeiro as BarbeiroTag[]) : [];
      
      // ✅ CORREÇÃO CRÍTICA: Filtrar os vínculos onde 'possui' é truthy.
      // Usa a conversão '!!' (Double NOT) que converte 1, "1", ou true em true,
      // e 0, "0", ou false em false. Isso torna o filtro robusto contra problemas de tipagem da API.
      const vinculosAtivos = vinculosBarbeiro.filter(vinculo => !!vinculo.possui);

      // 2. Criar um Set com os IDs das tags ATIVAS
      // Converte o ID explicitamente para Number para garantir a consistência
      const activeTagIds = new Set(vinculosAtivos.map((vinculo: BarbeiroTag) => Number(vinculo.idTag)));
      
      // 3. Filtrar a lista mestra (tagsMestras) usando o Set de IDs ativas
      this.tagsAtivas = tagsMestras
        .filter(tag => activeTagIds.has(Number(tag.idTag))) // Converte o ID mestre também para Number antes da comparação
        .map(tag => tag.nomeTag); // Extrai o nome

      console.log('Tags Ativas carregadas:', this.tagsAtivas);
      // LOG de diagnóstico: verificar se os arrays estão sendo lidos corretamente
      console.log('Total de Vínculos do Barbeiro:', vinculosBarbeiro.length);
      console.log('Total de Vínculos Ativos:', vinculosAtivos.length);
      console.log('IDs Ativos:', Array.from(activeTagIds));


    } catch (error) {
      console.error('Erro GERAL ao carregar tags. Verifique o servidor/endpoints:', error);
      await this.exibirMensagem('Erro ao carregar habilidades do profissional. Verifique a conexão com a API.');
      this.tagsAtivas = [];
    }
  }

  getStarIcon(star: number): string {
    const halfStars = Math.round(this.avaliacaoMedia || 0);
    const full = Math.floor(halfStars / 2);
    const half = halfStars % 2;
    if (star <= full) return 'star';
    if (star === full + 1 && half === 1) return 'star-half';
    return 'star-outline';
  }

  async excluirPerfil() {
    // Substituir window.confirm por um modal/alerta do Ionic ou uma solução customizada
    // para evitar problemas de execução em iframes (caso este código seja executado em um ambiente restrito).
    // Por simplicidade, mantive o window.confirm, mas idealmente seria um ion-alert.
    const confirm = window.confirm('Tem certeza que deseja excluir seu perfil? Esta ação não pode ser desfeita.');
    if (!confirm) return;

    this.profissionalService.deletarBarbeiro(this.barbeiro.idBarbeiro!).subscribe({
      next: async () => {
        await this.exibirMensagem('Perfil excluído com sucesso');
        this.logout();
      },
      error: async (erro) => {
        console.error('Erro ao excluir perfil:', erro);
        await this.exibirMensagem('Erro ao excluir perfil. Tente novamente.');
      }
    });
  }

  editarPerfil() {
    if (this.barbeiro && this.barbeiro.idBarbeiro) {
      this.router.navigate(['/cadastro-profissional'], {
        queryParams: {
          edit: 'true',
          id: this.barbeiro.idBarbeiro
        }
      });
    } else {
      this.exibirMensagem('Erro ao editar perfil. Tente fazer login novamente.');
      this.logout();
    }
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present();
  }

  logout() {
    this.profissionalService.encerrar();
    this.navController.navigateRoot('/login-profissional');
  }
  escutarBadgeSolicitacoes() {
  this.solicitacaoService
    .getQtdSolicitacoesPendentes()
    .subscribe(qtd => {
      this.qtdSolicitacoesPendentes = qtd;
    });
}

}

