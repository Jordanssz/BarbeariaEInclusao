import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarbeiroTagPage } from './barbeiro-tag.page';

describe('BarbeiroTagPage', () => {
  let component: BarbeiroTagPage;
  let fixture: ComponentFixture<BarbeiroTagPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BarbeiroTagPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
