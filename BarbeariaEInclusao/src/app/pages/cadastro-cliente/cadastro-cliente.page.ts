import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
// Importação do Serviço e do Modelo
import { UsuarioService } from 'src/app/services/usuario';
import { Usuario } from 'src/app/model/usuario'; 

@Component({
  selector: 'app-cadastro-cliente',
  templateUrl: './cadastro-cliente.page.html',
  styleUrls: ['./cadastro-cliente.page.scss'],
  standalone: false
})
export class CadastroClientePage implements OnInit {
  formGroup!: FormGroup;
  fotoPreview: string | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;
  
  // Variável para armazenar a foto (se selecionada)
  private fotoSelecionadaBase64: string | null = null;
  
  // Modo edição: true se está editando um usuário existente
  modoEdicao: boolean = false;
  idUsuarioEmEdicao: number | null = null;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private route: ActivatedRoute,
    // Injeção do UsuarioService
    private usuarioService: UsuarioService 
  ) {}

  ngOnInit() {
    // Note: 'descricao' não é usado no backend atual, mas é mantido no formulário.
    // O backend validado só usa: nome, email, telefone, senha e foto.
    this.formGroup = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', Validators.required],
      senha: ['', Validators.required],
      descricao: [''], 
    });
    
    // Verifica se há um ID na rota (modo edição)
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idUsuarioEmEdicao = parseInt(id, 10);
        this.modoEdicao = true;
        this.carregarDadosUsuario(this.idUsuarioEmEdicao);
      }
    });
  }
  
  /**
   * Carrega os dados do usuário para edição.
   */
  carregarDadosUsuario(idUsuario: number) {
    this.usuarioService.findById(idUsuario).subscribe({
      next: (usuario) => {
        this.formGroup.patchValue({
          nome: usuario.nomeUsuario,
          email: usuario.emailUsuario,
          telefone: usuario.telefoneUsuario,
          senha: usuario.senhaUsuario
        });
        
        // Carrega a foto se existir
        if (usuario.fotoUsuario) {
          // Adiciona o prefixo data: se não estiver presente
          if (!usuario.fotoUsuario.startsWith('data:')) {
            this.fotoPreview = 'data:image/png;base64,' + usuario.fotoUsuario;
          } else {
            this.fotoPreview = usuario.fotoUsuario;
          }
        }
      },
      error: (erro) => {
        console.error('Erro ao carregar dados do usuário:', erro);
        this.exibirMensagem('Erro ao carregar dados do usuário.', 3000);
      }
    });
  }

  cadastrar() {
    if (this.formGroup.valid) {
      // 1. Mapeia os valores do formulário para o modelo Usuario
      const usuario = new Usuario();
      usuario.nomeUsuario = this.formGroup.get('nome')!.value;
      usuario.emailUsuario = this.formGroup.get('email')!.value;
      usuario.telefoneUsuario = this.formGroup.get('telefone')!.value;
      usuario.senhaUsuario = this.formGroup.get('senha')!.value;
      
      // 2. Adiciona a foto (se houver, removendo o prefixo 'data:...')
      if (this.fotoSelecionadaBase64) {
        usuario.fotoUsuario = this.fotoSelecionadaBase64.split(',')[1];
      }
      
      if (this.modoEdicao && this.idUsuarioEmEdicao) {
        // Modo edição: atualiza usuário existente
        usuario.idUsuario = this.idUsuarioEmEdicao;
        console.log('Dados de edição enviados:', usuario);
        
        this.usuarioService.update(usuario).subscribe({
          next: (usuarioAtualizado) => {
            this.exibirMensagem(`Perfil de ${usuarioAtualizado.nomeUsuario} atualizado com sucesso!`);
            
            // Volta à página anterior ou para o menu principal
            this.navCtrl.back();
          },
          error: (erro) => {
            console.error('Erro ao atualizar usuário:', erro);
            let msgErro = 'Erro ao tentar atualizar. Tente novamente.';
            if (erro.status === 400) {
              msgErro = erro.error || 'Dados inválidos.';
            } else if (erro.status === 500) {
              msgErro = 'Erro no servidor.';
            }
            this.exibirMensagem(msgErro, 3000);
          }
        });
      } else {
        // Modo cadastro: cria novo usuário
        console.log('Dados de cadastro enviados:', usuario);
        
        this.usuarioService.cadastrar(usuario).subscribe({
          next: (usuarioCadastrado) => {
            this.exibirMensagem(`Cadastro de ${usuarioCadastrado.nomeUsuario} realizado com sucesso!`);
            
            // Redireciona para a tela de login após o cadastro bem-sucedido
            this.navCtrl.navigateRoot('/login-cliente'); 
          },
          error: (erro) => {
            console.error('Erro ao cadastrar usuário:', erro);
            // Trata erros específicos da API se necessário (ex: email já existe)
            let msgErro = 'Erro ao tentar cadastrar. Tente novamente.';
            if (erro.status === 400) {
              msgErro = erro.error || 'Dados inválidos.';
            } else if (erro.status === 500) {
              msgErro = 'Erro no servidor. Verifique se o email já está cadastrado.';
            }
            this.exibirMensagem(msgErro, 3000);
          }
        });
      }
      
    } else {
      this.exibirMensagem('Preencha todos os campos obrigatórios.', 3000);
    }
  }

  async exibirMensagem(msg: string, duration: number = 1500) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: duration
    });
    await toast.present();
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // Salva o Base64 completo para preview
        this.fotoPreview = reader.result as string; 
        // Salva o Base64 completo para enviar (será tratado antes de enviar)
        this.fotoSelecionadaBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
