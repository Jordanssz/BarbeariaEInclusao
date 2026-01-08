import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClienteMenuPage } from './cliente-menu.page';

describe('ClienteMenuPage', () => {
  let component: ClienteMenuPage;
  let fixture: ComponentFixture<ClienteMenuPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClienteMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
