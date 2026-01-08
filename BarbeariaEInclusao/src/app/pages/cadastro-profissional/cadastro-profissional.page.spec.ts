import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadastroProfissionalPage } from './cadastro-profissional.page';

describe('CadastroProfissionalPage', () => {
  let component: CadastroProfissionalPage;
  let fixture: ComponentFixture<CadastroProfissionalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastroProfissionalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
