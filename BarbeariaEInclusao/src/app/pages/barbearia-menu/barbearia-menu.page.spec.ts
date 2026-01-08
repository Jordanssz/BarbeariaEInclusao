import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarbeariaMenuPage } from './barbearia-menu.page';

describe('BarbeariaMenuPage', () => {
  let component: BarbeariaMenuPage;
  let fixture: ComponentFixture<BarbeariaMenuPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BarbeariaMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
