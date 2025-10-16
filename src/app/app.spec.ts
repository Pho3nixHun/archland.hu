import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app';

describe('AppComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppComponent],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it('should render title', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const compiled: unknown = fixture.nativeElement;

        if (!(compiled instanceof HTMLElement)) {
            throw new TypeError('Root element is not an HTMLElement');
        }

        expect(compiled.querySelector('h1')?.textContent ?? '').toContain(
            'Hello, archland-website'
        );
    });
});
