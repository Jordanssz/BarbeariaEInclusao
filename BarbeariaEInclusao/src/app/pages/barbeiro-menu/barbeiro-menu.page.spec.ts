import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarbeiroMenuPage } from './barbeiro-menu.page';

describe('BarbeiroMenuPage', () => {
  let component: BarbeiroMenuPage;
  let fixture: ComponentFixture<BarbeiroMenuPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BarbeiroMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
