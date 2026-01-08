import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarbeariaAcessibilidadesPage } from './barbearia-acessibilidades.page';

describe('BarbeariaAcessibilidadesPage', () => {
  let component: BarbeariaAcessibilidadesPage;
  let fixture: ComponentFixture<BarbeariaAcessibilidadesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BarbeariaAcessibilidadesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
