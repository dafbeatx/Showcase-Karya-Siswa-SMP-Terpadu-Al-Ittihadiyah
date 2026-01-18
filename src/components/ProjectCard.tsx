'use client';
import React from 'react';
import { Code, Palette, Beaker, Trash2, FolderOpen } from 'lucide-react';
import Image from 'next/image';

interface Project {
    id: string;
    title: string;
    student_name: string;
    category: string;
    description: string;
    image_url: string;
    drive_link: string;
}

interface ProjectCardProps {
    project: Project;
    requestDelete: (id: string) => void;
}

export default function ProjectCard({ project, requestDelete }: ProjectCardProps) {
    const { id, title, student_name, category, description, image_url, drive_link } = project;

    return (
        <div className="group relative bg-[#18181b]/60 backdrop-blur-md border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-500/20 flex flex-col">
            <div className="relative h-48 md:h-56 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                <Image
                    src={image_url || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop'}
                    alt={title}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
                    <span className="px-2.5 py-1 text-[10px] md:text-xs font-bold uppercase rounded-full bg-black/50 border border-white/10 flex items-center gap-1.5 backdrop-blur-md">
                        {category === 'Tech' ? <Code size={10} className="text-blue-400" /> : category === 'Art' ? <Palette size={10} className="text-pink-400" /> : <Beaker size={10} className="text-green-400" />}
                        {category}
                    </span>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); requestDelete(id); }}
                    className="absolute top-3 right-3 md:top-4 md:right-4 z-30 p-2 bg-red-600/80 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                    title="Hapus Projek"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            <div className="p-5 md:p-6 flex flex-col flex-grow">
                <h3 className="text-lg md:text-xl font-bold mb-1 group-hover:text-purple-300 transition-colors">{title}</h3>
                <p className="text-xs md:text-sm text-gray-400 mb-3 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gray-500"></span> {student_name}</p>
                <p className="text-gray-500 text-xs md:text-sm mb-5 line-clamp-2">{description}</p>
                <a href={drive_link} target="_blank" rel="noreferrer" className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-xs md:text-sm hover:bg-white hover:text-black transition-all duration-300">
                    <FolderOpen size={14} /> Buka Google Drive
                </a>
            </div>
        </div>
    );
}
