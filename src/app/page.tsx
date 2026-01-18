'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProjectCard from '@/components/ProjectCard';
import Footer from '@/components/Footer';
import UploadModal from '@/components/Modals/UploadModal';
import DeleteModal from '@/components/Modals/DeleteModal';
import { getProjects, uploadProject, deleteProject } from '@/actions/projects';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const categories = ['All', 'Tech', 'Art', 'Science'];

  useEffect(() => {
    fetchProjects();
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let result = projects;
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.student_name.toLowerCase().includes(term)
      );
    }
    setFilteredProjects(result);
  }, [projects, searchTerm, activeCategory]);

  async function fetchProjects() {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await getProjects();
      if (data) {
        setProjects(data);
      } else {
        setHasError(true);
      }
    } catch (error) {
      console.error(error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleProjectSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      await uploadProject(formData);
      await fetchProjects();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectDelete = async (password: string) => {
    if (password !== 'Smpterpadualittihadiyah.12345') {
      alert('Password Admin Salah!');
      return;
    }
    if (!deletingId) return;

    try {
      await deleteProject(deletingId);
      await fetchProjects();
      setDeletingId(null);
    } catch (error: any) {
      alert('Gagal menghapus: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-purple-500/30 selection:text-purple-200">
      <Navbar
        isScrolled={isScrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        setIsModalOpen={setIsModalOpen}
      />

      <main>
        <Hero
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearchSubmit={handleSearchSubmit}
          filterCategories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          setIsModalOpen={setIsModalOpen}
        />

        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-24">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="animate-spin text-purple-500" size={40} />
              <p className="text-gray-500 font-medium animate-pulse text-sm">Memuat mahakarya siswa...</p>
            </div>
          ) : hasError ? (
            <div className="text-center py-24 bg-red-500/5 rounded-3xl border border-red-500/10 flex flex-col items-center gap-4">
              <p className="text-red-400 font-medium">Gagal memuat data dari server.</p>
              <button
                onClick={() => fetchProjects()}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-bold transition-all"
              >
                Coba Lagi
              </button>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-fade-in">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  requestDelete={(id) => setDeletingId(id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/5 border-dashed">
              <p className="text-gray-500 text-lg">Belum ada karya untuk kategori ini.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />

      <UploadModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onSubmit={handleProjectSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteModal
        id={deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleProjectDelete}
        isDeleting={false} // Add proper state if needed
      />
    </div>
  );
}
