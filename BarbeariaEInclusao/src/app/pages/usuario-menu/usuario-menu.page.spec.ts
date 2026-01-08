import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuarioMenuPage } from './usuario-menu.page';

describe('UsuarioMenuPage', () => {
  let component: UsuarioMenuPage;
  let fixture: ComponentFixture<UsuarioMenuPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
