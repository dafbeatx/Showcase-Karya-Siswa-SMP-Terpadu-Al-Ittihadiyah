import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, ExternalLink, Search, Code, Palette, Beaker, 
  Menu, X, Plus, Loader2, Send, Edit3, Sparkles, ArrowRight,
  Phone, MapPin, Github, Youtube, Instagram, Heart, Copyright,
  Trash2, Image as ImageIcon, Link as LinkIcon, Upload
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, onSnapshot, serverTimestamp, deleteDoc, doc 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged 
} from 'firebase/auth';

// --- CONFIG FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDwu4HV63wOXwJjrcBUnRQY_NCa8rU2woo",
  authDomain: "dafbeatx-project.firebaseapp.com",
  projectId: "dafbeatx-project",
  storageBucket: "dafbeatx-project.firebasestorage.app",
  messagingSenderId: "685029378988",
  appId: "1:685029378988:web:9d5d5a82be5bba6a000809",
  measurementId: "G-0G43FJ0T44"
};

let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e) {}

const auth = getAuth(app);
const db = getFirestore(app);

const APP_ID = 'smp-al-ittihadiyah-showcase';
const predefinedFormCategories = ["Tech", "Art", "Science"];
const filterCategories = ["All", "Tech", "Art", "Science", "Lainnya"];

// --- HELPER: CONVERT GOOGLE DRIVE LINK ---
const getGoogleDriveImgUrl = (url) => {
  if (!url) return '';
  // Cek apakah ini link Google Drive
  if (url.includes('drive.google.com')) {
    // Ekstrak ID file
    const idMatch = url.match(/\/d\/(.*?)\/|\/d\/(.*)/);
    const fileId = idMatch ? (idMatch[1] || idMatch[2]) : null;
    if (fileId) {
      // Gunakan layanan lh3.googleusercontent.com untuk thumbnail langsung
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }
  return url;
};

export default function App() {
  const [projects, setProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  
  // State untuk mode upload gambar (Link atau File)
  const [imageUploadMode, setImageUploadMode] = useState('link'); // 'link' or 'file'
  
  const [formData, setFormData] = useState({
    title: '', student: '', category: 'Tech', image: '', desc: '', driveLink: '', tags: ''
  });

  useEffect(() => {
    signInAnonymously(auth).catch((error) => console.error(error));
    const unsubscribe = onAuthStateChanged(auth, setUser);
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
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- HANDLE FILE UPLOAD (LOCAL) ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi Ukuran (Max 800KB agar muat di Firestore)
    if (file.size > 800 * 1024) {
      alert("Ukuran gambar terlalu besar! Harap pilih gambar di bawah 800KB.");
      return;
    }

    // Convert ke Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
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

  // --- HANDLE DELETE ---
  const handleDelete = async (id) => {
    // Konfirmasi sederhana (password simple)
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus projek ini?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'projects', id));
      alert("Projek berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Gagal menghapus. Cek permission.");
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
    if (!user) return alert("Menunggu koneksi...");
    if (!formData.category.trim()) return alert("Isi kategori!");

    setIsSubmitting(true);
    try {
      const formattedTags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      
      // Proses URL Gambar (Cek apakah Drive atau Link Biasa)
      let finalImage = formData.image;
      if (imageUploadMode === 'link' && finalImage.includes('drive.google.com')) {
        finalImage = getGoogleDriveImgUrl(finalImage);
      }
      
      // Fallback Image
      if (!finalImage.trim()) {
        finalImage = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop';
      }

      await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'projects'), {
        ...formData,
        tags: formattedTags,
        image: finalImage,
        createdAt: serverTimestamp()
      });

      setFormData({ title: '', student: '', category: 'Tech', image: '', desc: '', driveLink: '', tags: '' });
      setIsCustomCategory(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Gagal upload.");
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
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#09090b]/80 backdrop-blur-md border-b border-white/5 py-3 md:py-4' : 'bg-transparent py-4 md:py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer flex-shrink-0">
            <div className="h-9 w-9 md:h-10 md:w-10 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
               <img src="/logo1.png" alt="Logo" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-white transition-all">SMP Terpadu</span>
              <span className="text-[9px] md:text-[10px] font-medium text-gray-500 tracking-[0.2em] uppercase -mt-0.5 group-hover:text-purple-400 transition-colors">Al-Ittihadiyah</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => setIsModalOpen(true)} className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]">
              <Plus size={16} /> Submit Project
            </button>
          </div>
          <button className="md:hidden text-white p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#09090b]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 md:hidden animate-fade-in p-6">
          <button onClick={() => { setIsModalOpen(true); setMobileMenuOpen(false); }} className="w-full max-w-xs px-8 py-4 bg-white text-black text-lg font-bold rounded-full flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-95 transition-transform">
             <Plus size={20} /> Submit Project
          </button>
          <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 hover:text-white mt-4 text-sm">Tutup Menu</button>
        </div>
      )}

      {/* Hero Section */}
      <section className="pt-32 md:pt-44 pb-12 md:pb-16 px-4 md:px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 text-[10px] md:text-xs font-medium mb-6 md:mb-8 animate-fade-in-up hover:bg-white/10 transition-colors cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Showcase Resmi SMP Terpadu Al-Ittihadiyah
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-4 md:mb-6 leading-[1.15] md:leading-tight">
          Karya <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">Siswa/i</span>, <br /> Masa Depan Kalian.
        </h1>
        <p className="text-gray-400 text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-2">
          Selamat datang di platform galeri digital SMP Terpadu Al-Ittihadiyah. Tempat kami merayakan kreativitas, inovasi teknologi, dan bakat seni dari seluruh siswa.
        </p>
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl mx-auto mb-6 md:mb-8 group px-2">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
          <input type="text" placeholder="Cari judul karya atau nama siswa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-14 text-sm md:text-base text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder-gray-600" />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-white/10 hover:bg-purple-500 rounded-lg text-gray-400 hover:text-white transition-all" title="Cari"><ArrowRight size={18} /></button>
        </form>
        <div className="flex flex-wrap justify-center gap-2 px-2">
          {filterCategories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 md:px-6 rounded-full text-xs md:text-sm font-medium border transition-all duration-300 ${activeCategory === cat ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white'}`}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section id="gallery-section" className="px-4 md:px-6 pb-24 max-w-7xl mx-auto flex-grow w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredProjects.map((p) => (
            <div key={p.id} className="group relative bg-[#18181b]/60 backdrop-blur-md border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-500/20 flex flex-col">
              {/* Image with Delete Button */}
              <div className="relative h-48 md:h-56 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                <img src={p.image} alt={p.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                     onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop'} />
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
                  <span className="px-2.5 py-1 text-[10px] md:text-xs font-bold uppercase rounded-full bg-black/50 border border-white/10 flex items-center gap-1.5 backdrop-blur-md">
                    {p.category === 'Tech' ? <Code size={10} className="text-blue-400"/> : p.category === 'Art' ? <Palette size={10} className="text-pink-400"/> : <Beaker size={10} className="text-green-400"/>}
                    {p.category}
                  </span>
                </div>

                {/* DELETE BUTTON (Hidden by default, show on hover) */}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                  className="absolute top-3 right-3 md:top-4 md:right-4 z-30 p-2 bg-red-600/80 hover:bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                  title="Hapus Projek"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-5 md:p-6 flex flex-col flex-grow">
                <h3 className="text-lg md:text-xl font-bold mb-1 group-hover:text-purple-300 transition-colors">{p.title}</h3>
                <p className="text-xs md:text-sm text-gray-400 mb-3 flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gray-500"></span> {p.student}</p>
                <p className="text-gray-500 text-xs md:text-sm mb-5 line-clamp-2">{p.desc}</p>
                <a href={p.driveLink} target="_blank" rel="noreferrer" className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-xs md:text-sm hover:bg-white hover:text-black transition-all duration-300">
                  <FolderOpen size={14} /> Buka Google Drive
                </a>
              </div>
            </div>
          ))}
        </div>
        {filteredProjects.length === 0 && <div className="text-center py-20 text-gray-500 flex flex-col items-center"><Sparkles className="mb-4 text-purple-500/50" size={48}/>Belum ada projek yang diupload.</div>}
      </section>

      {/* FOOTER SECTION */}
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
                <li><a href="https://wa.me/62895351251395" target="_blank" rel="noreferrer" className="flex items-start gap-3 text-gray-400 hover:text-green-400 transition-colors group"><Phone size={18} className="mt-1 group-hover:scale-110 transition-transform"/><span className="text-sm">+62 895 3512 51395 <br/><span className="text-xs opacity-60">(WhatsApp Admin)</span></span></a></li>
                <li><a href="https://maps.google.com/?q=SMP+Terpadu+Al-Ittihadiyah+Ciampea+Bogor+jawa+barat+Indonesia" target="_blank" rel="noreferrer" className="flex items-start gap-3 text-gray-400 hover:text-blue-400 transition-colors group"><MapPin size={18} className="mt-1 group-hover:scale-110 transition-transform"/><span className="text-sm">Kp Pasar Salasa, Desa Ciampea Udik, Bogor, Jawa Barat.</span></a></li>
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
                <div className="flex items-center gap-2 text-xs text-gray-400"><Copyright size={12}/> <span>MIT License</span></div>
                <p className="text-xs text-gray-500">Website ini open-source. Dibuat dengan <Heart size={10} className="inline text-red-500"/> oleh Dafa Maulana, S.Pd selaku Guru Informatika.</p>
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

      {/* Modal Submit (Mobile Optimized) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center px-0 md:px-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-[#121214] border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl p-6 md:p-8 h-[85vh] md:max-h-[90vh] overflow-y-auto relative shadow-2xl shadow-purple-900/20">
            <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6 md:hidden"></div>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors hidden md:block"><X size={20}/></button>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 md:hidden"><X size={24}/></button>

            <h2 className="text-xl md:text-2xl font-bold mb-1 flex items-center gap-2 text-white"><Sparkles className="text-purple-500"/> Submit Karya</h2>
            <p className="text-gray-400 text-xs md:text-sm mb-6">Bagikan karyamu kepada seluruh teman sekolah.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4 pb-10 md:pb-0">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase ml-1">Judul Karya</label>
                  <input required name="title" value={formData.title} onChange={handleInputChange} placeholder="Misal: Robot Pintar" className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none transition-colors"/>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase ml-1">Nama Siswa / Tim</label>
                  <input required name="student" value={formData.student} onChange={handleInputChange} placeholder="Misal: Ahmad & Tim" className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none transition-colors"/>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase ml-1">Kategori</label>
                <div className="flex gap-2 flex-wrap">
                  {[...predefinedFormCategories, "Custom"].map(cat => (
                    <button type="button" key={cat} onClick={() => handleCategorySelect(cat)}
                      className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm border transition-all ${(!isCustomCategory && formData.category === cat) || (isCustomCategory && cat === "Custom") ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold' : 'bg-zinc-900 border-white/10 text-gray-400 hover:border-white/30'}`}>
                      {cat === "Custom" ? "Lainnya..." : cat}
                    </button>
                  ))}
                </div>
              </div>
              
              {isCustomCategory && (
                <div className="relative animate-fade-in-up">
                  <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" size={16}/>
                  <input required name="category" value={formData.category} onChange={handleInputChange} placeholder="Ketik nama kategori..." className="w-full bg-zinc-900 border border-purple-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none"/>
                </div>
              )}

              <div className="space-y-1">
                 <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase ml-1">Deskripsi</label>
                 <textarea required name="desc" value={formData.desc} onChange={handleInputChange} rows={3} placeholder="Ceritakan sedikit tentang karya ini..." className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none resize-none"/>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase ml-1">Link Google Drive</label>
                <div className="relative">
                  <FolderOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
                  <input required name="driveLink" value={formData.driveLink} onChange={handleInputChange} placeholder="https://drive.google.com/..." className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:border-purple-500 outline-none"/>
                </div>
              </div>

              {/* Upload Gambar (Pilih Mode) */}
              <div className="space-y-2">
                 <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase ml-1">Gambar Cover</label>
                 <div className="flex gap-2 mb-2">
                    <button type="button" onClick={() => setImageUploadMode('link')} className={`flex-1 py-2 text-xs rounded-lg border ${imageUploadMode === 'link' ? 'bg-white text-black border-white' : 'bg-zinc-900 border-white/10 text-gray-400'}`}> <LinkIcon className="inline mr-2" size={12}/> Link URL </button>
                    <button type="button" onClick={() => setImageUploadMode('file')} className={`flex-1 py-2 text-xs rounded-lg border ${imageUploadMode === 'file' ? 'bg-white text-black border-white' : 'bg-zinc-900 border-white/10 text-gray-400'}`}> <ImageIcon className="inline mr-2" size={12}/> Upload File </button>
                 </div>

                 {imageUploadMode === 'link' ? (
                   <input name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none text-xs md:text-sm"/>
                 ) : (
                   <div className="relative">
                     <div className="absolute inset-0 bg-zinc-900 border border-white/10 border-dashed rounded-xl flex items-center justify-center pointer-events-none">
                       <span className="text-gray-500 text-xs flex items-center gap-2"><Upload size={14}/> Pilih Gambar (Max 800KB)</span>
                     </div>
                     <input type="file" accept="image/*" onChange={handleFileChange} className="w-full h-12 opacity-0 cursor-pointer"/>
                     {formData.image && formData.image.startsWith('data:') && <p className="text-[10px] text-green-400 mt-1 text-center">Gambar berhasil dipilih!</p>}
                   </div>
                 )}
                 <p className="text-[10px] text-gray-600 italic">*Jika pakai URL Google Drive, pastikan aksesnya 'Public'.</p>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase ml-1">Tags</label>
                 <input name="tags" value={formData.tags} onChange={handleInputChange} placeholder="Tags (misal: IoT, Web)" className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none text-xs md:text-sm"/>
              </div>
              
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 flex justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="animate-spin"/> : <Send size={18}/>} Submit Sekarang
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}