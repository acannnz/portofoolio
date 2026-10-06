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

    public function test_every_skill_has_the_fields_the_ui_needs(): void
    {
        foreach (config('portfolio.skills') as $skill) {
            foreach (['name', 'category', 'serial', 'status', 'tags', 'icon'] as $key) {
                $this->assertArrayHasKey($key, $skill);
            }
        }
    }
}
