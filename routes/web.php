<?php

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Home', [
    'profile' => config('portfolio'),
]))->name('home');

Route::get('/projects/{slug}', function (string $slug) {
    $projects = config('portfolio.projects');
    $index = collect($projects)->search(fn (array $project) => ($project['slug'] ?? null) === $slug);
    abort_if($index === false || empty($projects[$index]['case_study']), 404);

    $project = $projects[$index];

    return Inertia::render('CaseStudy', [
        'project' => $project,
        'number' => $index + 1,
        'profile' => Arr::only(config('portfolio'), ['name', 'role', 'contact']),
    ])->withViewData(['meta' => [
        'title' => "{$project['title']} — Case Study",
        'description' => $project['case_study']['summary'],
    ]]);
})->name('projects.show');
