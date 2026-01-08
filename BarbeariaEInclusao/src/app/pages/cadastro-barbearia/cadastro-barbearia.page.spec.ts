import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastroBarbeariaPage } from './cadastro-barbearia.page';

describe('CadastroBarbeariaPage', () => {
  let component: CadastroBarbeariaPage;
  let fixture: ComponentFixture<CadastroBarbeariaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastroBarbeariaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
