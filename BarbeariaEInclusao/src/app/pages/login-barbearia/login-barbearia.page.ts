import { Component, OnInit } from '@angular/core';
import { Barbearia } from 'src/app/model/barbearia';
import { BarbeariaService } from 'src/app/services/barbearia';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-login-barbearia',
  templateUrl: './login-barbearia.page.html',
  styleUrls: ['./login-barbearia.page.scss'],
  standalone: false
})
export class LoginBarbeariaPage implements OnInit {

  barbearia: Barbearia;
  email: string;
  senha: string;
  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private navController: NavController,
    private barbeariaService: BarbeariaService
  ) {
    this.email = "";
    this.senha = "";
    this.barbearia = new Barbearia();

    this.formGroup = this.formBuilder.group({
      'email': [this.email, Validators.compose([Validators.required, Validators.email])],
      'senha': [this.senha, Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    this.barbeariaService.encerrar();
  }

  autenticar() {
    this.email = this.formGroup.value.email;
    this.senha = this.formGroup.value.senha;

    this.barbeariaService.autenticar(this.email, this.senha).subscribe({
      next: (barbearia) => {
        this.barbearia = barbearia;
        this.barbeariaService.registrar(this.barbearia);
        this.navController.navigateBack('/barbearia-menu');
      },
      error: (err) => {
        console.error('Email ou senha inválidos', err);
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