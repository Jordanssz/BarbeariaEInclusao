import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificacaoBarbeiroPage } from './notificacao-barbeiro.page';

describe('NotificacaoBarbeiroPage', () => {
  let component: NotificacaoBarbeiroPage;
  let fixture: ComponentFixture<NotificacaoBarbeiroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificacaoBarbeiroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
