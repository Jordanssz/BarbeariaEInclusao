import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AtendimentosMarcadosPage } from './atendimentos-marcados.page';

describe('AtendimentosMarcadosPage', () => {
  let component: AtendimentosMarcadosPage;
  let fixture: ComponentFixture<AtendimentosMarcadosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AtendimentosMarcadosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
