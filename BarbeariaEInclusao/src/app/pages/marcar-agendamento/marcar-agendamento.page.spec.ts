import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarcarAgendamentoPage } from './marcar-agendamento.page';

describe('MarcarAgendamentoPage', () => {
  let component: MarcarAgendamentoPage;
  let fixture: ComponentFixture<MarcarAgendamentoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MarcarAgendamentoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
