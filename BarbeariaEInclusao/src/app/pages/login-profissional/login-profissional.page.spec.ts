import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginProfissionalPage } from './login-profissional.page';

describe('LoginProfissionalPage', () => {
  let component: LoginProfissionalPage;
  let fixture: ComponentFixture<LoginProfissionalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginProfissionalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
