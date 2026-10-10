<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HomePageTest extends TestCase
{
    public function test_home_renders_profile_props(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home')
                ->has('profile.name')
                ->has('profile.skills', 6)
                ->has('profile.projects')
                ->has('profile.experience')
            );
    }

    public function test_projects_never_use_placeholder_links(): void
    {
        foreach (config('portfolio.projects') as $project) {
            $this->assertNotSame('#', $project['demo'], "{$project['title']} has a '#' demo link");
            $this->assertNotSame('#', $project['github'], "{$project['title']} has a '#' github link");
        }
    }

    public function test_case_study_page_renders_with_its_project(): void
    {
        $this->get('/projects/sistem-klinik')
            ->assertOk()
            ->assertSee('Case Study', false)
            ->assertInertia(fn (Assert $page) => $page
                ->component('CaseStudy')
                ->where('project.slug', 'sistem-klinik')
                ->has('project.case_study.modules')
                ->has('project.case_study.highlights')
                ->has('number')
                ->has('profile.name')
            );
    }

    public function test_unknown_case_study_returns_404(): void
    {
        $this->get('/projects/does-not-exist')->assertNotFound();
    }

    public function test_every_case_study_has_the_sections_the_page_needs(): void
    {
        foreach (config('portfolio.projects') as $project) {
            if (! isset($project['case_study'])) {
                continue;
            }
            $this->assertNotEmpty($project['slug'] ?? null, "{$project['title']} has a case study but no slug");
            foreach (['role', 'period', 'client', 'summary', 'challenges', 'modules', 'highlights', 'stack'] as $key) {
                $this->assertArrayHasKey($key, $project['case_study'], "{$project['title']} case study is missing '{$key}'");
            }
        }
    }

    public function test_every_skill_has_the_fields_the_ui_needs(): void
    {
        foreach (config('portfolio.skills') as $skill) {
            foreach (['name', 'category', 'serial', 'status', 'tags', 'icon'] as $key) {
                $this->assertArrayHasKey($key, $skill);
            }
        }
    }
}
