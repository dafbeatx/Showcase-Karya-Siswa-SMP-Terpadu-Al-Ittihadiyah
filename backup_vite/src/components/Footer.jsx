import React from 'react';
import { Phone, MapPin, Github, Youtube, Instagram, Heart, Copyright } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black/40 backdrop-blur-lg pt-16 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden"><img src="/logo1.png" alt="Logo" className="h-full w-full object-cover" /></div>
                            <span className="font-bold text-lg">SMP Terpadu Al-Ittihadiyah</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">Platform showcase karya digital siswa untuk menginspirasi dan berinovasi di era teknologi.</p>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-bold text-white">Hubungi Kami</h3>
                        <ul className="space-y-3">
                            <li><a href="https://wa.me/62895351251395" target="_blank" rel="noreferrer" className="flex items-start gap-3 text-gray-400 hover:text-green-400 transition-colors group"><Phone size={18} className="mt-1 group-hover:scale-110 transition-transform" /><span className="text-sm">+62 895 3512 51395 <br /><span className="text-xs opacity-60">(WhatsApp Admin)</span></span></a></li>
                            <li><a href="https://maps.google.com/?q=SMP+Terpadu+Al-Ittihadiyah+Ciampea+Bogor+jawa+barat+Indonesia" target="_blank" rel="noreferrer" className="flex items-start gap-3 text-gray-400 hover:text-blue-400 transition-colors group"><MapPin size={18} className="mt-1 group-hover:scale-110 transition-transform" /><span className="text-sm">Kp Pasar Salasa, Desa Ciampea Udik, Bogor, Jawa Barat.</span></a></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-bold text-white">Ikuti Kami</h3>
                        <div className="flex flex-wrap gap-3">
                            <a href="https://github.com/dafbeatx" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all hover:-translate-y-1"><Github size={18} /></a>
                            <a href="https://youtube.com/@smpterpadualittihadiyahbogor?si=ZREUlBQW8hNF9ja1" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-red-600 hover:text-white transition-all hover:-translate-y-1"><Youtube size={18} /></a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-purple-500 hover:to-pink-500 hover:text-white transition-all hover:-translate-y-1"><Instagram size={18} /></a>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-bold text-white">Lisensi & Pembuat</h3>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-400"><Copyright size={12} /> <span>MIT License</span></div>
                            <p className="text-xs text-gray-500">Website ini open-source. Dibuat dengan <Heart size={10} className="inline text-red-500" /> oleh Dafa Maulana, S.Pd selaku Guru Informatika.</p>
                            <div className="pt-2 border-t border-white/5"><p className="text-[10px] text-gray-600">v1.0.0 (Beta)</p></div>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-600 text-sm text-center md:text-left">© 2025 SMP Terpadu Al-Ittihadiyah. All rights reserved.</p>
                    <p className="text-gray-600 text-xs flex items-center gap-1">Powered by React & Firebase</p>
                </div>
            </div>
        </footer>
    );
}
