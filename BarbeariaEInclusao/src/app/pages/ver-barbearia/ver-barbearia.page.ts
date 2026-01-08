import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Barbearia } from 'src/app/model/barbearia';
import { BarbeariaService } from 'src/app/services/barbearia';
import { ServicoService } from 'src/app/services/servico';
import { ProfissionalService } from 'src/app/services/profissional';
import { TagService } from 'src/app/services/tag';
import { ToastController, NavController } from '@ionic/angular';
import { GeolocationService } from 'src/app/services/geolocationservice';
import { formatarEnderecoSimples } from 'src/app/app.component';
import { lastValueFrom, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AvaliacaoService } from 'src/app/services/avaliacao';

@Component({
  selector: 'app-ver-barbearia',
  templateUrl: './ver-barbearia.page.html',
  styleUrls: ['./ver-barbearia.page.scss'],
  standalone: false
})
export class VerBarbeariaPage implements OnInit {

  barbearia: Barbearia = new Barbearia();
  servicos: any[] = [];
  profissionais: any[] = [];
  habilidadesProfissionais: string[] = [];
  avaliacaoMedia: number = 0;
  comentarios: any[] = [];
  mostRecentComentario: any = null;
  public Math = Math;
  enderecoCompleto: string = 'Carregando localização...';
  caracteristicasAcessiveis: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private barbeariaService: BarbeariaService,
    private servicoService: ServicoService,
    private profissionalService: ProfissionalService,
    private tagService: TagService,
    private toastController: ToastController,
    private navController: NavController,
    private geolocationService: GeolocationService,
    private avaliacaoService: AvaliacaoService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.navController.navigateRoot('/inicio');
      return;
    }

    this.carregarBarbearia(id);
  }

  carregarBarbearia(id: number) {
    this.barbeariaService.buscarPorId(id).subscribe({
      next: (barbearia) => {
        this.barbearia = barbearia;

        if (this.barbearia.fotoBarbearia) {
        const foto = this.barbearia.fotoBarbearia;
        if (foto.startsWith('/uploads/')) {
          this.barbearia.fotoBarbearia = `http://localhost:8080${foto}`;
        } else if (!foto.startsWith('data:')) {
          this.barbearia.fotoBarbearia = 'data:image/png;base64,' + foto;
        }
      }

        if (barbearia.latitude != null && barbearia.longitude != null) {
          this.converterCoordenadasParaEndereco(barbearia.latitude, barbearia.longitude);
        }
        this.carregarServicos(id);
        this.carregarProfissionais(id);
        this.carregarAcessibilidades(id);

            // Calcula média e carrega comentários relacionados a essa barbearia
            (async () => {
              try {
                this.avaliacaoMedia = await this.avaliacaoService.calcularMediaPorBarbearia(id);
                this.comentarios = await this.avaliacaoService.listarComentariosPorBarbearia(id);
                this.mostRecentComentario = (this.comentarios && this.comentarios.length) ? this.comentarios[0] : null;
              } catch (err) {
                console.error('Erro ao carregar avaliações:', err);
              }
            })();
      },
      error: (err) => {
        console.error('Erro ao carregar barbearia:', err);
        this.exibirMensagem('Erro ao carregar barbearia.');
      }
    });
  }

  async carregarAcessibilidades(idBarbearia: number) {
    try {
      const resposta = await lastValueFrom(this.barbeariaService.buscarCaracteristicasBarbearia(idBarbearia));
      const ativas = resposta.filter((c: any) => c.possui === true);

      this.caracteristicasAcessiveis = ativas
        .map((c: any) => c.nomeCaracteristica || c.caracteristica?.nome || c.nome)
        .filter((n: string) => !!n);
    } catch (err) {
      console.error('Erro ao carregar acessibilidades:', err);
    }
  }

  converterCoordenadasParaEndereco(lat: number, lon: number) {
    
    if (lat && lon) {
      this.geolocationService.getFormattedAddress(lat, lon).subscribe({
        next: (address) => {
          this.enderecoCompleto = formatarEnderecoSimples(address);
        },
        error: () => {
          this.enderecoCompleto = 'Endereço não encontrado';
        }
      });
    } else {
      this.enderecoCompleto = 'Localização não cadastrada.';
    }
  }

  carregarServicos(idBarbearia: number) {
    this.servicoService.listarPorBarbearia(idBarbearia).subscribe({
      next: (servicos) => {
        this.servicos = servicos.map((s: any) => {
          if (s.fotoServico) {
          if (s.fotoServico.startsWith('/uploads/')) {
            s.fotoServico = `http://localhost:8080${s.fotoServico}`;
          } else if (!s.fotoServico.startsWith('data:')) {
            s.fotoServico = 'data:image/png;base64,' + s.fotoServico;
          }
        }
        // ---------------------
        return s;
      });
      },
      error: (err) => console.error('Erro ao carregar serviços:', err)
    });
  }

  carregarProfissionais(idBarbearia: number) {
    this.profissionalService.getBarbeirosByBarbearia(idBarbearia).subscribe({
      next: (profissionais) => {
        const lista = profissionais || [];

        // Normaliza os profissionais e prepara o array inicial
        const normalized = lista.map((p: any) => {
  const foto = p.fotoBarbeiro || p.fotoProfissional || p.foto || null;
  const nome = p.nomeBarbeiro || p.nomeProfissional || p.nome || p.apelido || '';
  const id = p.idBarbeiro || p.idProfissional || p.id || null;
  const funcao = p.funcao || p.cargo || null;
  
  // --- CORREÇÃO AQUI ---
  let fotoNormalized = 'assets/avatar-placeholder.svg';
  if (foto) {
    if (foto.startsWith('/uploads/')) {
      fotoNormalized = `http://localhost:8080${foto}`;
    } else if (foto.startsWith('data:')) {
      fotoNormalized = foto;
    } else {
      fotoNormalized = 'data:image/png;base64,' + foto;
    }
  }
  // ---------------------

  return {
    idProfissional: id,
    nomeProfissional: nome,
    fotoProfissional: fotoNormalized,
    funcao: funcao,
    tags: [] as string[]
  } as any;
});

        // Carrega a lista mestra de tags e depois os vínculos de cada profissional
        this.tagService.buscarTags().subscribe({
          next: (tagsMaster: any[]) => {
            const tagMap = new Map<number, string>();
            (tagsMaster || []).forEach(t => tagMap.set(Number(t.idTag ?? t.id), t.nomeTag ?? t.nome));

            // Para cada profissional, buscar suas tags vinculadas
            const calls = normalized.map(p => {
              if (!p.idProfissional) return of(p);
              return this.tagService.buscarTagsBarbeiro(p.idProfissional).pipe(
                map((vinculos: any[]) => {
                  const ativos = (vinculos || []).filter((v: any) => !!v.possui);
                  const nomes = ativos.map((v: any) => tagMap.get(Number(v.idTag)) || String(v.idTag));
                  p.tags = nomes;
                  return p;
                }),
                catchError((err) => {
                  console.error('Erro ao obter tags do profissional', p.idProfissional, err);
                  p.tags = [];
                  return of(p);
                })
              );
            });

            // Executa todas as chamadas e atualiza this.profissionais
            forkJoin(calls).subscribe({
              next: (resultado: any[]) => {
                this.profissionais = resultado;
                // Agrega tags únicas de todos os profissionais para exibir na página da barbearia
                const set = new Set<string>();
                resultado.forEach((p: any) => (p.tags || []).forEach((t: string) => set.add(t)));
                this.habilidadesProfissionais = Array.from(set);
              },
              error: (err) => {
                console.error('Erro ao carregar tags dos profissionais:', err);
                this.profissionais = normalized;
              }
            });
          },
          error: (err) => {
            console.error('Erro ao carregar lista mestra de tags:', err);
            // Sem master list, apenas atribui normalized sem tags
            this.profissionais = normalized;
          }
        });
      },
      error: (err) => {
        console.error('Erro ao carregar profissionais:', err);
        this.profissionais = [];
      }
    });
  }

  getStarIcon(star: number): string {
    const halfStars = Math.round(this.avaliacaoMedia || 0); // cada meia estrela = 1
    const full = Math.floor(halfStars / 2);
    const half = halfStars % 2;
    if (star <= full) return 'star';
    if (star === full + 1 && half === 1) return 'star-half';
    return 'star-outline';
  }

  async exibirMensagem(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 1500,
      position: 'bottom'
    });
    toast.present();
  }

  selecionarServico(servico: any) {
    this.navController.navigateForward(['/marcar-agendamento', servico.idServico]);
  }

  
}
