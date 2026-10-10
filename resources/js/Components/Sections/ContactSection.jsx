import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, GitBranch, Mail } from 'lucide-react';

export default function ContactSection({ contact = {} }) {
    const [emailCopied, setEmailCopied] = useState(false);

    // Fallback for visitors without a configured mail client
    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(contact.email);
            setEmailCopied(true);
            setTimeout(() => setEmailCopied(false), 2000);
        } catch {
            window.location.href = `mailto:${contact.email}`;
        }
    };

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

                {(contact.email || contact.github) && (
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
                        {contact.email && (
                            <a
                                href={`mailto:${contact.email}`}
                                className="px-8 py-4 rounded-full bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg"
                            >
                                <Mail className="w-4 h-4" aria-hidden="true" /> Send Email
                            </a>
                        )}
                        {contact.github && (
                            <a
                                href={contact.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-8 py-4 rounded-full border border-white/15 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 hover:border-white/30 transition-all flex items-center gap-2"
                            >
                                <GitBranch className="w-4 h-4" aria-hidden="true" /> GitHub
                            </a>
                        )}
                    </div>
                )}

                {contact.email && (
                    <button
                        type="button"
                        onClick={copyEmail}
                        title="Copy email"
                        className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors select-text"
                    >
                        {contact.email}
                        {emailCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                    </button>
                )}
            </motion.div>
        </section>
    );
}
