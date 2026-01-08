import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioAcessibilidadePage } from './usuario-acessibilidade.page';

describe('UsuarioAcessibilidadePage', () => {
  let component: UsuarioAcessibilidadePage;
  let fixture: ComponentFixture<UsuarioAcessibilidadePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioAcessibilidadePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
