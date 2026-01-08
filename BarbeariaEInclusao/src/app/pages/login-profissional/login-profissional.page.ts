import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, NavController } from '@ionic/angular';
import { ProfissionalService } from 'src/app/services/profissional';
import { Barbeiro } from 'src/app/model/barbeiro';

@Component({
  selector: 'app-login-profissional',
  templateUrl: './login-profissional.page.html',
  styleUrls: ['./login-profissional.page.scss'],
  standalone: false
})
export class LoginProfissionalPage implements OnInit {
  email: string;
  senha: string;
  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private navController: NavController,
    private profissionalService: ProfissionalService
  ) {
    this.email = "";
    this.senha = "";

    this.formGroup = this.formBuilder.group({
      'email': [this.email, Validators.compose([Validators.required, Validators.email])],
      'senha': [this.senha, Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    // Aqui você pode adicionar a lógica para encerrar qualquer sessão anterior
  }

  autenticar() {
    this.email = this.formGroup.value.email;
    this.senha = this.formGroup.value.senha;

    // Aqui você irá implementar a lógica de autenticação do profissional
    this.profissionalService.autenticar(this.email, this.senha).subscribe({
      next: (barbeiro: Barbeiro) => {
        // registra e navega para o menu do barbeiro
        this.profissionalService.registrar(barbeiro);
        this.navController.navigateRoot(['/barbeiro-menu']);
      },
      error: (err) => {
        console.error('Erro ao autenticar barbeiro:', err);
        this.exibirMensagem('Email ou senha inválidos');
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
