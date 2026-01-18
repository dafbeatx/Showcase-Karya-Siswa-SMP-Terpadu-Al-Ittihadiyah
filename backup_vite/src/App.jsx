import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import {
  collection, addDoc, onSnapshot, serverTimestamp, deleteDoc, doc
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// lib & utils
import { auth, db } from './lib/firebase';
import { compressImage, getGoogleDriveImgUrl } from './utils/helpers';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectCard from './components/ProjectCard';
import Footer from './components/Footer';
import UploadModal from './components/Modals/UploadModal';
import DeleteModal from './components/Modals/DeleteModal';

const APP_ID = 'smp-al-ittihadiyah-showcase';
const predefinedFormCategories = ["Tech", "Art", "Science"];
const filterCategories = ["All", "Tech", "Art", "Science", "Lainnya"];

export default function App() {
  const [projects, setProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState('file');
  const [isProcessingImg, setIsProcessingImg] = useState(false);

  // State Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [localImageFiles, setLocalImageFiles] = useState([]);

  const [formData, setFormData] = useState({
    title: '', student: '', category: 'Tech', image: '', desc: '', driveLink: '', tags: ''
  });

  useEffect(() => {
    signInAnonymously(auth)
      .then(() => console.log("AUTH OK: Anonymous login berhasil"))
      .catch((error) => {
        console.error("AUTH FAIL:", error.code, error.message);
        alert("AUTH FAIL: " + error.code);
      });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const projectsRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'projects');
    const unsubscribe = onSnapshot(projectsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setProjects(data);
    }, (error) => {
      if (error.code !== 'permission-denied') console.error("Data Error:", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (files.length > 2) {
      alert("Maksimal hanya boleh upload 2 foto!");
      return;
    }

    setIsProcessingImg(true);
    const processedImages = [];

    for (const file of files) {
      try {
        const compressedBase64 = await compressImage(file);
        processedImages.push(compressedBase64);
      } catch (err) {
        console.error("Gagal kompres gambar:", err);
      }
    }

    setLocalImageFiles(processedImages);
    if (processedImages.length > 0) {
      setFormData(prev => ({ ...prev, image: processedImages[0] }));
    }
    setIsProcessingImg(false);
  };

  const handleCategorySelect = (cat) => {
    if (cat === "Custom") {
      setIsCustomCategory(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setIsCustomCategory(false);
      setFormData(prev => ({ ...prev, category: cat }));
    }
  };

  const requestDelete = (id) => {
    setProjectToDelete(id);
    setDeletePassword("");
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    if (!projectToDelete) return;

    if (deletePassword !== "Smpterpadualittihadiyah.12345") {
      alert("Password Salah! Akses Ditolak.");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'projects', projectToDelete));
    } catch (err) {
      console.error("Gagal hapus:", err);
    } finally {
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
      setDeletePassword("");
      setIsDeleting(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const gallerySection = document.getElementById('gallery-section');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth' });
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category.trim()) return alert("Isi kategori!");
    if (isProcessingImg) return alert("Tunggu sebentar, sedang memproses gambar...");

    setIsSubmitting(true);
    try {
      const formattedTags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      let finalImage = formData.image;

      if (imageUploadMode === 'file' && localImageFiles.length > 0) {
        const randomIndex = Math.floor(Math.random() * localImageFiles.length);
        finalImage = localImageFiles[randomIndex];
      }
      else if (imageUploadMode === 'link' && finalImage.includes('drive.google.com')) {
        finalImage = getGoogleDriveImgUrl(finalImage);
      }

      if (!finalImage || !finalImage.trim()) {
        finalImage = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop';
      }

      await addDoc(
        collection(db, 'artifacts', APP_ID, 'public', 'data', 'projects'),
        {
          ...formData,
          tags: formattedTags,
          image: finalImage,
          gallery: imageUploadMode === 'file' ? localImageFiles : [],
          createdAt: serverTimestamp(),
        }
      );

      console.log("WRITE OK: Data berhasil masuk Firestore");
      setFormData({
        title: '', student: '', category: 'Tech', image: '', desc: '', driveLink: '', tags: ''
      });
      setLocalImageFiles([]);
      setIsCustomCategory(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error("WRITE FAIL:", error.code, error.message);
      alert("Terjadi kesalahan: " + error.code);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchCat = activeCategory === "All" ? true
      : activeCategory === "Lainnya" ? !predefinedFormCategories.includes(p.category)
        : p.category === activeCategory;
    const search = searchTerm.toLowerCase();
    const matchSearch = (p.title || '').toLowerCase().includes(search) || (p.student || '').toLowerCase().includes(search);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-purple-500 selection:text-white flex flex-col">
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <Navbar
        isScrolled={isScrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        setIsModalOpen={setIsModalOpen}
      />

      <Hero
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearchSubmit={handleSearchSubmit}
        filterCategories={filterCategories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        setIsModalOpen={setIsModalOpen}
      />

      <section id="gallery-section" className="px-4 md:px-6 pb-24 max-w-7xl mx-auto flex-grow w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredProjects.map((p) => (
            <ProjectCard key={p.id} project={p} requestDelete={requestDelete} />
          ))}
        </div>
        {filteredProjects.length === 0 && (
          <div className="text-center py-20 text-gray-500 flex flex-col items-center">
            <Sparkles className="mb-4 text-purple-500/50" size={48} />
            Belum ada projek yang diupload.
          </div>
        )}
      </section>

      <Footer />

      <DeleteModal
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        handleConfirmDelete={handleConfirmDelete}
        deletePassword={deletePassword}
        setDeletePassword={setDeletePassword}
        isDeleting={isDeleting}
      />

      <UploadModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handleSubmit={handleSubmit}
        formData={formData}
        handleInputChange={handleInputChange}
        predefinedFormCategories={predefinedFormCategories}
        handleCategorySelect={handleCategorySelect}
        isCustomCategory={isCustomCategory}
        imageUploadMode={imageUploadMode}
        setImageUploadMode={setImageUploadMode}
        isProcessingImg={isProcessingImg}
        handleFileChange={handleFileChange}
        localImageFiles={localImageFiles}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}