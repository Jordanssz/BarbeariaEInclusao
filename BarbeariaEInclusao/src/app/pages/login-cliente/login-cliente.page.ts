import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { UsuarioService } from 'src/app/services/usuario'; // Assumindo o caminho do serviço
import { Usuario } from 'src/app/model/usuario'; // Assumindo a importação do modelo

@Component({
  selector: 'app-login-cliente',
  templateUrl: './login-cliente.page.html',
  styleUrls: ['./login-cliente.page.scss'],
  standalone: false
})
export class LoginClientePage implements OnInit {
  formGroup!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    this.formGroup = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
  }

  login() {
    if (this.formGroup.valid) {
      const email = this.formGroup.get('email')!.value;
      const senha = this.formGroup.get('senha')!.value;

      // Chama o método de autenticação do serviço
      this.usuarioService.autenticar(email, senha).subscribe({
        next: (usuarioAutenticado) => {
          this.exibirMensagem(`Bem-vindo(a), ${usuarioAutenticado.nomeUsuario}!`);
          // ✅ CORREÇÃO: Navega para a tela de navegação de barbearias
          this.navCtrl.navigateRoot('/navegar-barbearias'); 
        },
        error: (erro) => {
          console.error('Erro de autenticação:', erro);
          let msgErro = 'Erro ao tentar fazer login. Verifique sua conexão.';
          if (erro.status === 401) {
            msgErro = 'Email ou senha incorretos. Tente novamente.';
          }
          this.exibirMensagem(msgErro, 3000);
        }
      });
    } else {
      this.exibirMensagem('Preencha o email e a senha corretamente.', 3000);
    }
  }

  async exibirMensagem(msg: string, duration: number = 1500) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: duration
    });
    await toast.present();
  }
}
