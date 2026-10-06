import React from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

export default function ContactSection({ email }) {
    return (
        <section id="contact" className="py-24 px-6 max-w-4xl mx-auto text-center relative z-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="glass-card rounded-3xl p-10 sm:p-14 space-y-8 border border-white/10 relative overflow-hidden"
            >
                <div className="ambient-glow w-60 h-60 bg-purple-600/20 -top-20 -right-20 pointer-events-none" />

                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Ready to Collaborate?</h2>
                <p className="text-zinc-400 max-w-lg mx-auto text-base">
                    Berminat membangun produk digital berstandar tinggi atau mengintegrasikan pengalaman interaktif pada platform Anda?
                </p>

                {email && (
                    <div className="flex justify-center gap-4 pt-2">
                        <a
                            href={`mailto:${email}`}
                            className="px-8 py-4 rounded-full bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg"
                        >
                            <Mail className="w-4 h-4" aria-hidden="true" /> Send Email
                        </a>
                    </div>
                )}
            </motion.div>
        </section>
    );
}
