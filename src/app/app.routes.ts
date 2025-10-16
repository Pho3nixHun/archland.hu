import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/home/home.component').then(c => c.HomeComponent),
    },
    {
        path: 'projects',
        loadComponent: () =>
            import('./pages/projects/projects.component').then(
                c => c.ProjectsComponent
            ),
    },
    {
        path: 'projects/:id',
        loadComponent: () =>
            import('./pages/project-detail/project-detail.component').then(
                c => c.ProjectDetailComponent
            ),
    },
    {
        path: 'about',
        redirectTo: '/#about',
    },
    {
        path: 'contact',
        redirectTo: '/#contact',
    },
    {
        path: '**',
        redirectTo: '',
    },
];
