import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { MotionConfig } from 'framer-motion';
import ParticleNetworkBackground from '../Components/ParticleNetworkBackground';
import ScrollyExperience from '../Components/ScrollyExperience';
import ContactSection from '../Components/Sections/ContactSection';
import ExperienceSection from '../Components/Sections/ExperienceSection';

export default function Home({ profile }) {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        // reducedMotion="user": framer-motion skips transform animations for prefers-reduced-motion
        <MotionConfig reducedMotion="user">
            <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-purple-500/20 selection:text-purple-300 relative">
                <Head title={`${profile.name} — ${profile.role}`} />

                <ParticleNetworkBackground />

                {/* Ambient glows: fixed to the viewport so they never cause horizontal scroll */}
                <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="ambient-glow w-[500px] h-[500px] bg-purple-900/15 -top-40 -left-40" />
                    <div className="ambient-glow w-[600px] h-[600px] bg-cyan-900/10 top-1/3 -right-40" />
                    <div className="ambient-glow w-[500px] h-[500px] bg-indigo-900/15 bottom-10 left-1/4" />
                </div>

                <main>
                    <ScrollyExperience profile={profile} />
                    <ExperienceSection experience={profile.experience} />
                    <ContactSection contact={profile.contact} />
                </main>

                <footer className="py-8 border-t border-zinc-900 text-center text-xs text-zinc-600 relative z-20">
                    © {new Date().getFullYear()} {profile.name}. Built with Laravel, Inertia, React &amp; Framer Motion.
                </footer>
            </div>
        </MotionConfig>
    );
}
