import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgendaBarbeiroPage } from './agenda-barbeiro.page';

describe('AgendaBarbeiroPage', () => {
  let component: AgendaBarbeiroPage;
  let fixture: ComponentFixture<AgendaBarbeiroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendaBarbeiroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
