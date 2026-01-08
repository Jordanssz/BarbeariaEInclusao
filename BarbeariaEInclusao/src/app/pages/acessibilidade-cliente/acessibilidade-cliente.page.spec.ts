import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AcessibilidadeClientePage } from './acessibilidade-cliente.page';

describe('AcessibilidadeClientePage', () => {
  let component: AcessibilidadeClientePage;
  let fixture: ComponentFixture<AcessibilidadeClientePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AcessibilidadeClientePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
