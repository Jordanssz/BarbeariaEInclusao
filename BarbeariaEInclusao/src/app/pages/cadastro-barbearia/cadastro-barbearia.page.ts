import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, NavController } from '@ionic/angular';
import { Barbearia } from 'src/app/model/barbearia';
import { BarbeariaService } from 'src/app/services/barbearia';
import { ActivatedRoute } from '@angular/router';

// Imports do Leaflet
import * as L from 'leaflet';

@Component({
  selector: 'app-cadastro-barbearia',
  templateUrl: './cadastro-barbearia.page.html',
  styleUrls: ['./cadastro-barbearia.page.scss'],
  standalone: false
})
export class CadastroBarbeariaPage implements OnInit, OnDestroy {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  barbearia: Barbearia;
  formGroup: FormGroup;
  isEditMode: boolean = false;

  fotoFile: File | null = null;
  fotoPreview: string | ArrayBuffer | null = null;
  
  // --- Propriedades do Mapa ---
  mostrarMapa: boolean = false; // Controla a visibilidade
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  // Coordenadas iniciais (pode ser o centro da sua cidade)
  private readonly defaultCenter: L.LatLngExpression = [-19.9190, -43.9387]; 
  private readonly defaultZoom: number = 13;
  // ---------------------------

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private navController: NavController,
    private barbeariaService: BarbeariaService,
    private route: ActivatedRoute
  ) {
    this.barbearia = new Barbearia();
    this.formGroup = this.formBuilder.group({
      'nomeBarbearia': ['', Validators.required],
      'emailBarbearia': ['', [Validators.required, Validators.email]],
      'senhaBarbearia': ['', [Validators.required, Validators.minLength(6)]],
      'enderecoBarbearia': [''],
      'descricaoBarbearia': ['', Validators.required],
      // NOVOS CAMPOS PARA LOCALIZAÇÃO
      'latitude': [null],
      'longitude': [null]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.barbeariaService.getBarbeariaLogada().subscribe(barbearia => {
        this.barbearia = barbearia;
        this.formGroup.patchValue({
          nomeBarbearia: barbearia.nomeBarbearia,
          emailBarbearia: barbearia.emailBarbearia,
          senhaBarbearia: barbearia.senhaBarbearia,
          enderecoBarbearia: barbearia.enderecoBarbearia,
          descricaoBarbearia: barbearia.descricaoBarbearia,
          // PREENCHE AS COORDENADAS SE EXISTIREM
          latitude: barbearia.latitude,
          longitude: barbearia.longitude,
        });
        if (barbearia.fotoBarbearia) {
          // Note: O backend precisa retornar a foto em um formato adequado para ser exibido.
          this.fotoPreview = barbearia.fotoBarbearia;
        }
      });
    }
  }
  
  ngOnDestroy(): void {
    // ESSENCIAL: Garante que o objeto mapa seja limpo da memória ao sair da página
    this.destruirMapa();
  }

  // Dispara o input file escondido
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  // Captura a imagem selecionada
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fotoFile = file;

      const reader = new FileReader();
      reader.onload = () => this.fotoPreview = reader.result;
      reader.readAsDataURL(file);
    }
  }
  
  // --- LÓGICA DO MAPA ---
  
  abrirMapa() {
    this.mostrarMapa = true;
    
    // O mapa precisa ser inicializado APÓS o elemento HTML ('leafletMap') 
    // estar visível no DOM.
    setTimeout(() => {
      this.iniciarMapa();
      
      const lat = this.formGroup.get('latitude')?.value;
      const lng = this.formGroup.get('longitude')?.value;
      
      if (lat && lng) {
        this.selecionarLocalizacao(lat, lng);
      }
    }, 50); 
  }

  fecharMapa() {
    this.mostrarMapa = false;
    this.destruirMapa();
    // O lat/lng no formGroup permanece, mantendo a seleção.
  }

  private iniciarMapa() {
    if (this.map) {
      this.destruirMapa(); 
    }
    
    const lat = this.formGroup.get('latitude')?.value;
    const lng = this.formGroup.get('longitude')?.value;
    const initialCoords: L.LatLngExpression = (lat && lng) ? [lat, lng] : this.defaultCenter;

    // Inicializa o mapa na div 'leafletMap'
    this.map = L.map('leafletMap', {
      center: initialCoords,
      zoom: this.defaultZoom,
      zoomControl: true,
      maxZoom: 18,
    });

    // Adiciona o tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Adiciona o evento de clique para seleção
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.selecionarLocalizacao(e.latlng.lat, e.latlng.lng);
    });

    // Garante que o mapa seja exibido corretamente
    this.map.invalidateSize();
  }

  private destruirMapa() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
  }

  selecionarLocalizacao(latitude: number, longitude: number) {
    // Atualiza os campos do formulário
    this.formGroup.patchValue({ latitude, longitude });

    const coords: L.LatLngExpression = [latitude, longitude];

    // Remove o marcador antigo, se existir
    if (this.marker) {
      this.map?.removeLayer(this.marker);
    }

    // Cria o novo marcador arrastável
    this.marker = L.marker(coords, { draggable: true });

    // Adiciona o evento para atualizar a coordenada ao arrastar
    this.marker.on('dragend', (e: any) => {
      const newCoords = e.target.getLatLng();
      this.formGroup.patchValue({
        latitude: newCoords.lat,
        longitude: newCoords.lng
      });
    });

    this.marker.addTo(this.map!);
    this.map?.setView(coords, this.map.getZoom());
  }
  
  // --- Função de cadastro/atualização ---
  cadastrar() {
    if (this.formGroup.invalid) return;
    
    // Se o mapa estiver visível, feche-o antes de submeter
    if (this.mostrarMapa) {
        this.fecharMapa();
    }

    const formData = new FormData();
    formData.append('nomeBarbearia', this.formGroup.value.nomeBarbearia);
    formData.append('emailBarbearia', this.formGroup.value.emailBarbearia);
    formData.append('senhaBarbearia', this.formGroup.value.senhaBarbearia);
    formData.append('enderecoBarbearia', this.formGroup.value.enderecoBarbearia || '');
    formData.append('descricaoBarbearia', this.formGroup.value.descricaoBarbearia);
    
    // Inclui LATITUDE e LONGITUDE no FormData
    formData.append('latitude', this.formGroup.value.latitude ? String(this.formGroup.value.latitude) : '');
    formData.append('longitude', this.formGroup.value.longitude ? String(this.formGroup.value.longitude) : '');

    if (this.fotoFile) {
      formData.append('fotoPerfil', this.fotoFile);
    }

    if (this.isEditMode) {
      // Garante que o ID da barbearia é passado para o update
      const id = this.barbearia.idBarbearia ? this.barbearia.idBarbearia : 0; 
      
      this.barbeariaService.atualizarComFoto(formData, id).subscribe({
        next: (res) => {
          this.exibirMensagem('Dados atualizados com sucesso!');
          this.navController.navigateBack('/barbearia-menu');
        },
        error: (erro) => {
          console.error('Erro ao atualizar barbearia:', erro);
          this.exibirMensagem('Erro ao atualizar. Tente novamente.');
        }
      });
    } else {
      this.barbeariaService.cadastrarComFoto(formData).subscribe({
  next: (res) => {
    // ✅ 1. A barbearia já é salva automaticamente no localStorage
    //     dentro do `tap()` do método cadastrarComFoto() no service.
    
    this.exibirMensagem('Cadastro realizado com sucesso!');

    // ✅ 2. Redirecionar diretamente para a página de acessibilidades
    //     da barbearia recém-criada
    this.navController.navigateRoot('/barbearia-acessibilidades');
  },
  error: (erro) => {
    console.error('Erro ao cadastrar barbearia:', erro);
    this.exibirMensagem('Erro ao cadastrar. Tente novamente.');
  }
});
    }
  }

  // Toast de feedback
  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 1500
    });
    toast.present();
  }
}
