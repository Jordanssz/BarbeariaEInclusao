import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginBarbeariaPage } from './login-barbearia.page';

describe('LoginBarbeariaPage', () => {
  let component: LoginBarbeariaPage;
  let fixture: ComponentFixture<LoginBarbeariaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginBarbeariaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
