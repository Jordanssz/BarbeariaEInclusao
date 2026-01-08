import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgendaBarbeariaPage } from './agenda-barbearia.page';

describe('AgendaBarbeariaPage', () => {
  let component: AgendaBarbeariaPage;
  let fixture: ComponentFixture<AgendaBarbeariaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendaBarbeariaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
