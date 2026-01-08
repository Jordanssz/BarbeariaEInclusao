import { Component, OnInit } from '@angular/core';
import { Barbearia } from 'src/app/model/barbearia'; // Ajuste o caminho conforme seu projeto
import { BarbeariaService } from 'src/app/services/barbearia'; // Ajuste o caminho conforme seu projeto
import { UsuarioService } from 'src/app/services/usuario'; // Importação para acessar ID do usuário logado
import { GeolocationService } from 'src/app/services/geolocationservice';
import { NavController, ToastController } from '@ionic/angular';
import { lastValueFrom } from 'rxjs'; 
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { Geolocation } from '@capacitor/geolocation';

// Definição da interface para incluir o campo de distância e acessibilidades
// espelhando o tipo retornado pelo BarbeariaService.
interface BarbeariaComDistancia extends Barbearia {
  distanciaKm?: number;
  caracteristicasAcessiveis?: string[];
}@Component({
 selector: 'app-navegar-barbearias',
 templateUrl: './navegar-barbearias.page.html',
 styleUrls: ['./navegar-barbearias.page.scss'],
 standalone: false
})
export class NavegarBarbeariasPage implements OnInit {

  // Lista de todas as barbearias (cache) - AGORA TIPADA COM DISTÂNCIA
  todasBarbearias: BarbeariaComDistancia[] = [];
  // Lista exibida na tela (filtrada) - AGORA TIPADA COM DISTÂNCIA
  barbeariasExibidas: BarbeariaComDistancia[] = [];
  // Variável para armazenar o termo de busca do usuário
  termoBusca: string = '';
  
  // Filtro de características de acessibilidade
  caracteristicasDisponiveis: string[] = [];
  filtroCaracteristicaSelecionada: string = '';
  
  // 💡 CORREÇÃO: Variáveis alteradas para 'public' para serem acessíveis no template HTML.
  public clienteLatitude: number | undefined;
  public clienteLongitude: number | undefined;
  
  // Subject para gerenciar a busca com debounce (evita chamadas excessivas)
  private buscaSubject = new Subject<string>();  constructor(
    private barbeariaService: BarbeariaService,
    private usuarioService: UsuarioService,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) { } ngOnInit() {
 this.obterLocalizacaoEBarbearias();
 this.setupBuscaAutomatica();
 }

 async obterLocalizacaoEBarbearias() {
 try {
 const position = await Geolocation.getCurrentPosition();
 this.clienteLatitude = position.coords.latitude;
 this.clienteLongitude = position.coords.longitude;
 
 this.carregarTodasBarbearias();
 } catch (e) {
 console.error('Erro ao obter localização:', e);
 this.exibirMensagem('Não foi possível obter sua localização. Listando sem ordem de distância.', 3000);
 // Se a localização falhar, carrega sem os parâmetros de distância
this.carregarTodasBarbearias(); 
 }
}
 
 /** * Configura o observable para buscar automaticamente após o usuário parar de digitar. */
 setupBuscaAutomatica() {
 this.buscaSubject.pipe(
 debounceTime(400), // Aguarda 400ms após a última tecla
 distinctUntilChanged() // Só prossegue se o valor for diferente do anterior
 ).subscribe(termo => {
 this.filtrarBarbearias(termo);
 });
 }
 
 /** * Dispara a filtragem a cada mudança no campo de busca. */
 onBuscaChange() {
 this.buscaSubject.next(this.termoBusca);
 }

 /**
    * Carrega todas as barbearias do servidor.
    */
carregarTodasBarbearias() {
 // O serviço agora retorna BarbeariaComDistancia[]
 this.barbeariaService.findAll(this.clienteLatitude, this.clienteLongitude).subscribe({ 
 next: (barbearias: BarbeariaComDistancia[]) => { 
 
 // --- NOVO: LÓGICA DE CONVERSÃO BASE64 PARA CADA ITEM ---
 const barbeariasTratadas = barbearias.map(barbearia => {
 if (barbearia.fotoBarbearia && !barbearia.fotoBarbearia.startsWith('data:')) {
 // Converte a string Base64 bruta para o formato data-URL
 barbearia.fotoBarbearia = 'data:image/png;base64,' + barbearia.fotoBarbearia;
 }
 return barbearia;
 });
 // --------------------------------------------------

        this.todasBarbearias = barbeariasTratadas;
        this.barbeariasExibidas = [...barbeariasTratadas]; 
        
        // Carrega as características de acessibilidade para todas as barbearias
        this.carregarAcessibilidadesParaTodas(this.todasBarbearias).then(() => {
          this.extrairCaracteristicasDisponiveis();
        });
        
        if (barbearias.length === 0) {
          this.exibirMensagem('Nenhuma barbearia cadastrada.', 3000);
        }
      },
      error: (erro) => {
        console.error('Erro ao carregar barbearias:', erro);
        this.exibirMensagem('Erro ao carregar barbearias. Tente novamente mais tarde.', 3000);
      }
    });
  }

  /**
    * Tenta extrair o nome da característica de diferentes estruturas possíveis do DTO.
    */
  private getCaracteristicaName(c: any): string | null {
    if (c.nomeCaracteristica) {
      return c.nomeCaracteristica;
    }
    if (c.caracteristica && c.caracteristica.nome) {
      return c.caracteristica.nome;
    }
    if (c.nome) {
      return c.nome;
    }
    return null;
  }

  /**
    * Carrega as características de acessibilidade para todas as barbearias.
    */
  async carregarAcessibilidadesParaTodas(barbearias: BarbeariaComDistancia[]) {
    for (const barbearia of barbearias) {
      if (barbearia.idBarbearia) {
        try {
          const resposta = await lastValueFrom(
            this.barbeariaService.buscarCaracteristicasBarbearia(barbearia.idBarbearia)
          );
          const ativas = resposta.filter((c: any) => c.possui === true);
          barbearia.caracteristicasAcessiveis = ativas
            .map((c: any) => this.getCaracteristicaName(c))
            .filter((nome: string | null): nome is string => !!nome && nome.trim().length > 0);
        } catch (err) {
          console.error(`Erro ao carregar acessibilidades para barbearia ${barbearia.idBarbearia}:`, err);
          barbearia.caracteristicasAcessiveis = [];
        }
      }
    }
  }

  /**
   * Extrai as características de acessibilidade únicas de todas as barbearias.
   */
  extrairCaracteristicasDisponiveis() {
    const caracteristicasSet = new Set<string>();
    for (const barbearia of this.todasBarbearias) {
      if (barbearia.caracteristicasAcessiveis) {
        barbearia.caracteristicasAcessiveis.forEach(c => {
          caracteristicasSet.add(c);
        });
      }
    }
    this.caracteristicasDisponiveis = Array.from(caracteristicasSet).sort();
  }

  /**
   * Filtra barbearias por característica selecionada no select.
   */
  aplicarFiltroCaracteristica(caracteristica: string) {
    this.filtroCaracteristicaSelecionada = caracteristica;
    this.filtrarBarbearias(this.termoBusca);
  }

  /**
    * Filtra as barbearias com base no termo de busca e característica selecionada.
    */
  filtrarBarbearias(termo: string) {
    let resultado = [...this.todasBarbearias];

    // Filtro por termo de busca
    const termoLowerCase = termo.toLowerCase().trim();
    if (termoLowerCase) {
      resultado = resultado.filter(b => 
        b.nomeBarbearia.toLowerCase().includes(termoLowerCase) ||
        (b.descricaoBarbearia && b.descricaoBarbearia.toLowerCase().includes(termoLowerCase))
      );
    }

    // Filtro por característica de acessibilidade
    if (this.filtroCaracteristicaSelecionada) {
      resultado = resultado.filter(b => 
        b.caracteristicasAcessiveis && 
        b.caracteristicasAcessiveis.includes(this.filtroCaracteristicaSelecionada)
      );
    }

    this.barbeariasExibidas = resultado;
  }  /**
    * Navega para o perfil detalhado da barbearia.
    */
  selecionarBarbearia(idBarbearia: number | undefined) {
    if (idBarbearia) {
      this.navCtrl.navigateForward(`/ver-barbearia/${idBarbearia}`);
    }
  }

  /**
    * Exibe uma mensagem Toast.
    */
  async exibirMensagem(msg: string, duration: number = 1500) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: duration,
      position: 'bottom',
    });
    await toast.present();
  }
  
  navegarParaPerfilUsuario() {
    const idUsuario = this.usuarioService.getIdUsuarioLogado();
    if (idUsuario) {
      this.navCtrl.navigateForward(`/cadastro-cliente/${idUsuario}`);
    } else {
      this.exibirMensagem('Nenhum usuário logado. Faça login novamente.', 3000);
    }
  }  /**
   * Navega para a página de agendamentos marcados.
   */
  navegarParaAgendamentos() {
    this.navCtrl.navigateForward('/atendimentos-marcados'); // Rota corrigida para a página de agendamentos
  }

  encerrarSessao() {
    // Lógica de logout do cliente...
    this.navCtrl.navigateRoot('/inicio');
  }
}
