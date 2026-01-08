import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddServicoPage } from './add-servico.page';

describe('AddServicoPage', () => {
  let component: AddServicoPage;
  let fixture: ComponentFixture<AddServicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddServicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
