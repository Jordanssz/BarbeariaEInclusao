import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { ProfissionalService } from 'src/app/services/profissional';
import { Barbeiro } from 'src/app/model/barbeiro';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-cadastro-profissional',
  templateUrl: './cadastro-profissional.page.html',
  styleUrls: ['./cadastro-profissional.page.scss'],
  standalone: false
})
export class CadastroProfissionalPage implements OnInit {
  formGroup!: FormGroup;
  fotoPreview: string | null = null;
  fotoFile: File | null = null;
  isEditMode = false;
  barbeiroId: number | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private profissionalService: ProfissionalService
  ) { }

  ngOnInit() {
    // Inicializa o formGroup imediatamente
    this.formGroup = this.fb.group({
      nomeBarbeiro: ['', Validators.required],
      emailBarbeiro: ['', [Validators.required, Validators.email]],
      telefoneBarbeiro: ['', Validators.required],
      senhaBarbeiro: ['', [Validators.required, Validators.minLength(6)]],
      descricaoBarbeiro: ['', Validators.required],
      idBarbeariaBarbeiro: [1, Validators.required],
    });

    // Depois processa os parâmetros
    this.route.queryParams.subscribe(params => {
      this.isEditMode = params['edit'] === 'true';
      this.barbeiroId = params['id'] ? Number(params['id']) : null;
      if (this.isEditMode && this.barbeiroId) {
        this.formGroup.get('senhaBarbeiro')?.clearValidators();
        this.formGroup.get('senhaBarbeiro')?.updateValueAndValidity();
        this.carregarDadosBarbeiro();
      }
    });
  }

  private carregarDadosBarbeiro() {
    if (!this.barbeiroId) return;
    
    this.profissionalService.getBarbeiroById(this.barbeiroId).subscribe({
      next: (barbeiro: Barbeiro) => {
        this.formGroup.patchValue({
          nomeBarbeiro: barbeiro.nomeBarbeiro,
          emailBarbeiro: barbeiro.emailBarbeiro,
          telefoneBarbeiro: barbeiro.telefoneBarbeiro,
          senhaBarbeiro: barbeiro.senhaBarbeiro,
          descricaoBarbeiro: barbeiro.descricaoBarbeiro,
          idBarbeariaBarbeiro: barbeiro.idBarbeariaBarbeiro
        });
        
        if (barbeiro.fotoBarbeiro) {
          this.fotoPreview = barbeiro.fotoBarbeiro;
        }
      },
      error: (erro: any) => {
        console.error('Erro ao carregar dados do barbeiro:', erro);
        this.exibirMensagem('Erro ao carregar dados do barbeiro');
      }
    });
  }

  cadastrar() {
    if (this.formGroup.valid) {
      const barbeiro: Barbeiro = this.formGroup.value;
      
      // 💡 CORREÇÃO: Garante que idBarbeiro é 'number' para atualização ou 'undefined' para cadastro.
      // Isso resolve o erro TS2322 (number | null não pode ser atribuído a number | undefined).
      barbeiro.idBarbeiro = this.isEditMode && this.barbeiroId ? this.barbeiroId : undefined;

      // Se tiver foto, usa FormData
      if (this.fotoFile) {
        const formData = new FormData();

        // 💡 CORREÇÃO: Removemos a iteração. Apenas adicionamos o arquivo de foto,
        // pois o Service agora serializa e anexa o objeto Barbeiro como JSON.
        formData.append('file', this.fotoFile);

        const observable = this.isEditMode 
          // 💡 CORREÇÃO DA CHAMADA: Passa o objeto barbeiro como primeiro argumento
          ? this.profissionalService.atualizarComFoto(barbeiro, formData, this.barbeiroId!)
          // 💡 CORREÇÃO DA CHAMADA: Passa o objeto barbeiro como primeiro argumento
          : this.profissionalService.cadastrarComFoto(barbeiro, formData);

        observable.subscribe({
          next: (response) => {
            const mensagem = this.isEditMode ? 'Perfil atualizado com sucesso!' : 'Cadastro realizado com sucesso!';
            if (this.isEditMode) {
              this.profissionalService.registrar(response);
            }
            this.exibirMensagem(mensagem);
            this.navCtrl.navigateBack(this.isEditMode ? '/barbeiro-menu' : '/login-profissional');
          },
          error: (erro) => {
            console.error(this.isEditMode ? 'Erro ao atualizar:' : 'Erro ao cadastrar:', erro);
            let mensagem = this.isEditMode ? 'Erro ao atualizar perfil' : 'Erro ao realizar cadastro';

            if (erro.status === 400 && erro.error?.message) {
              mensagem = erro.error.message;
            }

            this.exibirMensagem(mensagem);
          }
        });
      } else {
        // Se não tiver foto, envia apenas os dados do barbeiro
        const observable = this.isEditMode
          ? this.profissionalService.atualizar(barbeiro)
          : this.profissionalService.cadastrar(barbeiro);

        observable.subscribe({
          next: (response) => {
            const mensagem = this.isEditMode ? 'Perfil atualizado com sucesso!' : 'Cadastro realizado com sucesso!';
            if (this.isEditMode) {
              this.profissionalService.registrar(response);
            }
            this.exibirMensagem(mensagem);
            this.navCtrl.navigateBack(this.isEditMode ? '/barbeiro-menu' : '/login-profissional');
          },
          error: (erro) => {
            console.error(this.isEditMode ? 'Erro ao atualizar:' : 'Erro ao cadastrar:', erro);
            let mensagem = this.isEditMode ? 'Erro ao atualizar perfil' : 'Erro ao realizar cadastro';

            if (erro.status === 400 && erro.error?.message) {
              mensagem = erro.error.message;
            }

            this.exibirMensagem(mensagem);
          }
        });
      }
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.fotoFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async exibirMensagem(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 1500
    });
    await toast.present();
  }
}
