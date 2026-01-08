import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavegarBarbeariasPage } from './navegar-barbearias.page';

describe('NavegarBarbeariasPage', () => {
  let component: NavegarBarbeariasPage;
  let fixture: ComponentFixture<NavegarBarbeariasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NavegarBarbeariasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
