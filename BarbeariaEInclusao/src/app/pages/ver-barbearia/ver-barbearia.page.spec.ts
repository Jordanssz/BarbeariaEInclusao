import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerBarbeariaPage } from './ver-barbearia.page';

describe('VerBarbeariaPage', () => {
  let component: VerBarbeariaPage;
  let fixture: ComponentFixture<VerBarbeariaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerBarbeariaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
