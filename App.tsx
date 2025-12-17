
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ChevronRight, 
  Calendar, 
  TrendingUp, 
  Smartphone, 
  Zap, 
  Globe, 
  Users, 
  CreditCard,
  Phone,
  Download,
  CheckCircle,
  Menu,
  X,
  ArrowRight,
  Shield,
  Star,
  ExternalLink,
  Lock,
  FileText,
  Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import Background3D from './components/Background3D';
import { STRATO_ENTITIES, PAYMENT_DETAILS, VALUES } from './constants';
import { FormData, Entity } from './types';

const EntityIcon = ({ name, className }: { name: string, className?: string }) => {
  switch (name) {
    case 'Calendar': return <Calendar className={className} />;
    case 'TrendingUp': return <TrendingUp className={className} />;
    case 'Smartphone': return <Smartphone className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'Users': return <Users className={className} />;
    default: return <Zap className={className} />;
  }
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.9, y: 20 }} 
          className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl"
        >
          <div className="p-8 md:p-12">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-cinzel text-2xl font-bold text-white tracking-widest uppercase">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar text-slate-400 leading-relaxed font-light">
              {children}
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeEntity, setActiveEntity] = useState<Entity | null>(null);
  const [modalContent, setModalContent] = useState<{title: string, content: React.ReactNode} | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    nom: '',
    prenom: '',
    cnib: '',
    cursus: '',
    cvSummary: ''
  });
  const [step, setStep] = useState<'form' | 'payment' | 'validation' | 'card'>('form');
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.05], [1, 0.8]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 'form') setStep('payment');
    else if (step === 'payment') setStep('validation');
    else if (step === 'validation') setStep('card');
  };

  const downloadCard = async () => {
    if (!cardRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      // Small delay to ensure any potential animations settle
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // Higher resolution
        backgroundColor: null,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          // Adjust any elements in the clone if needed
          const clonedCard = clonedDoc.getElementById('membership-card');
          if (clonedCard) clonedCard.style.boxShadow = 'none';
        }
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Carte-Strato-${formData.nom.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      // Fallback to print if canvas fails
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const openLegalModal = (type: 'privacy' | 'terms') => {
    if (type === 'privacy') {
      setModalContent({
        title: "Confidentialité",
        content: (
          <div className="space-y-6">
            <p>La Stratosphere s'engage à protéger l'intégrité et la confidentialité des données de ses bâtisseurs. Vos informations (CNIB, CV) ne sont utilisées que pour le processus d'accréditation interne.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Stockage sécurisé sur serveurs décentralisés.</li>
              <li>Aucun partage avec des tiers sans consentement explicite.</li>
              <li>Droit de rectification immédiat via l'administrateur.</li>
            </ul>
          </div>
        )
      });
    } else {
      setModalContent({
        title: "Conditions d'Accès",
        content: (
          <div className="space-y-6">
            <p>L'accès à la Stratosphère exige l'adhésion aux valeurs fondamentales : Honneur, Discipline, Respect.</p>
            <p>Tout manquement aux codes de conduite du Club peut entraîner une révocation immédiate de la carte de membre sans remboursement.</p>
            <p>Le paiement de 12 500 FCFA constitue un droit d'entrée perpétuel sauf infraction grave.</p>
          </div>
        )
      });
    }
  };

  const openGovernanceModal = () => {
    setModalContent({
      title: "Gouvernance",
      content: (
        <div className="space-y-6">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <h4 className="text-white font-cinzel mb-2">Le Conseil des Étoiles</h4>
            <p className="text-sm">Une assemblée de leaders stratégiques veillant sur l'éthique et l'expansion de la holding. La gouvernance est basée sur la méritocratie et la vision à long terme.</p>
          </div>
          <p>Chaque décision est pesée à l'aune de notre mission : élever l'humanité par la structure et l'innovation.</p>
        </div>
      )
    });
  };

  const openProjectsModal = () => {
    setModalContent({
      title: "Projets Stellaires",
      content: (
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-xl">
              <span className="text-xs font-bold text-blue-400">EN COURS</span>
              <h5 className="text-white font-bold mt-1 uppercase">Cité Stratosphérique Bobo</h5>
              <p className="text-xs mt-2">Un hub physique d'incubation technologique au cœur du Burkina Faso.</p>
            </div>
            <div className="p-4 border border-indigo-500/20 bg-indigo-500/5 rounded-xl opacity-60">
              <span className="text-xs font-bold text-slate-500">PROGRAMMÉ Q4 2025</span>
              <h5 className="text-white font-bold mt-1 uppercase">Strato Aerospace</h5>
              <p className="text-xs mt-2">Exploration des opportunités de télécommunications satellitaires.</p>
            </div>
          </div>
        </div>
      )
    });
  };

  return (
    <div className="min-h-screen text-slate-100 selection:bg-blue-500/30 selection:text-white">
      <Background3D />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-slate-950/20 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-900 to-[#002855] rounded-full flex items-center justify-center border border-white/20 shadow-lg shadow-blue-900/20">
            <span className="font-cinzel font-bold text-xl text-white">S</span>
          </div>
          <span className="font-cinzel text-lg tracking-[0.2em] font-bold text-white">LA STRATOSPHÈRE</span>
        </div>
        
        <div className="hidden md:flex gap-8 items-center font-cinzel text-xs tracking-[0.2em]">
          <a href="#about" className="hover:text-blue-400 transition-colors uppercase">Vision</a>
          <a href="#entities" className="hover:text-blue-400 transition-colors uppercase">Entités</a>
          <a href="#join" className="hover:text-blue-400 transition-colors uppercase">Rejoindre</a>
          <button 
            onClick={() => document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-2 bg-blue-700 text-white hover:bg-white hover:text-blue-900 transition-all duration-300 rounded-full font-bold shadow-lg shadow-blue-900/40"
          >
            ADMISSION
          </button>
        </div>

        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-40 bg-[#00122e] p-8 flex flex-col justify-center items-center gap-8 text-2xl font-cinzel"
          >
            <a href="#about" onClick={() => setIsMenuOpen(false)}>VISION</a>
            <a href="#entities" onClick={() => setIsMenuOpen(false)}>ENTITÉS</a>
            <a href="#join" onClick={() => setIsMenuOpen(false)}>REJOINDRE</a>
            <button onClick={() => { setIsMenuOpen(false); openGovernanceModal(); }}>GOUVERNANCE</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Sections */}
      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section className="h-screen flex flex-col justify-center items-center text-center px-4 pt-20">
          <motion.div
            style={{ opacity, scale }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <div className="inline-block px-4 py-1 border border-blue-500/30 rounded-full bg-blue-500/10 text-blue-400 text-[10px] tracking-[0.3em] font-bold uppercase mb-8">
              Élévation • Convergence • Grandeur
            </div>
            <h1 className="text-6xl md:text-9xl font-bold mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-blue-300 leading-none">
              STRATO <br /> SPHERE
            </h1>
            <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto italic font-light mb-12 px-4 leading-relaxed">
              "L'espace d'élévation où les idées deviennent des constellations et les leaders des étoiles guidant l'humanité vers l'infini."
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center gap-3 border border-white/20 px-10 py-5 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all font-cinzel tracking-[0.2em] text-sm"
              >
                LA VISION
                <ChevronRight size={18} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center gap-3 bg-blue-700 hover:bg-blue-600 px-10 py-5 rounded-full transition-all font-cinzel tracking-[0.2em] text-sm shadow-xl shadow-blue-900/40"
              >
                REJOINDRE
                <ArrowRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="min-h-screen py-32 px-6 md:px-20 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 gap-20 items-center"
            >
              <div className="order-2 md:order-1">
                <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white font-cinzel tracking-tight leading-tight">
                  UN UNIVERS <br /> <span className="text-blue-500">SANS LIMITES</span>
                </h2>
                <div className="space-y-6 text-slate-400 text-lg leading-relaxed font-light">
                  <p>
                    La Stratosphère est une holding multidimensionnelle qui regroupe plusieurs entités stratégiques — Strato Events, Strato FX, Strato x Telecom, Strato Zone et Strato Global Business.
                  </p>
                  <p>
                    Elle incarne un univers d’élévation et de convergence, où les idées deviennent des projets, les projets des structures, et les structures des constellations reliées par une vision commune : bâtir avec noblesse, discipline et grandeur.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10">
                    {VALUES.map((val) => (
                      <div key={val.name} className="p-5 border border-white/5 rounded-2xl bg-white/5 hover:bg-blue-900/20 transition-all group">
                        <h4 className="font-cinzel text-blue-400 mb-2 tracking-widest text-sm group-hover:text-white transition-colors uppercase">{val.name}</h4>
                        <p className="text-xs text-slate-500 group-hover:text-slate-300">{val.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100 }}
                className="relative order-1 md:order-2 flex justify-center"
              >
                <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full animate-pulse"></div>
                <div className="relative z-10 w-full max-w-md aspect-square bg-[#f5f5dc] rounded-[3rem] p-8 shadow-2xl flex flex-col items-center justify-center border-8 border-blue-900/30 overflow-hidden group">
                  <div className="w-full h-full border-4 border-[#002855] rounded-full flex flex-col items-center justify-center relative p-4">
                    <div className="absolute top-4 left-0 right-0 flex justify-center gap-2">
                       {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 bg-[#002855] rotate-45 shadow-sm" />)}
                    </div>
                    <div className="w-48 h-48 rounded-full border-2 border-[#002855] relative overflow-hidden flex items-center justify-center">
                       <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,transparent_40%,#002855_40%)]" style={{ backgroundSize: '20px 20px' }} />
                       <Globe size={120} className="text-[#002855] relative z-10" />
                       <div className="absolute w-[120%] h-12 border-2 border-[#002855] rounded-full rotate-[30deg] z-20" />
                    </div>
                    <div className="mt-8 text-center">
                      <h3 className="font-cinzel text-3xl font-bold text-[#002855] leading-none">LA</h3>
                      <h3 className="font-cinzel text-xl font-bold text-[#002855] tracking-[0.1em]">STRATOSPHÈRE</h3>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10 pointer-events-none" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ENTITIES SECTION */}
        <section id="entities" className="min-h-screen py-32 px-6 md:px-20 bg-slate-950">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-24">
              <span className="text-blue-500 font-bold tracking-[0.5em] text-[10px] uppercase block mb-4">Structure Multi-Secteurs</span>
              <h2 className="text-5xl md:text-7xl font-bold mb-6 font-cinzel text-white leading-tight">NOS CONSTELLATIONS</h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg font-light">
                Chaque entité de la Stratosphère est un pôle d'excellence stratégique relié par une vision unique de développement.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {STRATO_ENTITIES.map((entity, idx) => (
                <motion.div
                  key={entity.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -15 }}
                  onClick={() => setActiveEntity(entity)}
                  className="group cursor-pointer relative p-10 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl overflow-hidden transition-all duration-500"
                >
                  <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${entity.color} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-700`}></div>
                  
                  <div className="w-16 h-16 mb-8 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-600/20 group-hover:border-blue-500/50 transition-all duration-500">
                    <EntityIcon name={entity.icon} className="text-white w-8 h-8 group-hover:scale-110 transition-transform" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 font-cinzel text-white tracking-wide">{entity.name}</h3>
                  <p className="text-slate-500 group-hover:text-slate-300 mb-10 leading-relaxed font-light transition-colors line-clamp-2">
                    {entity.description}
                  </p>
                  
                  <button className="flex items-center gap-3 text-xs font-bold tracking-[0.3em] text-blue-400 group-hover:text-white transition-all uppercase">
                    Explorer <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* REGISTRATION & PAYMENT FLOW */}
        <section id="join" className="min-h-screen py-32 px-6 md:px-20 relative overflow-hidden bg-gradient-to-b from-slate-950 to-[#00122e]">
          <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full"></div>
          <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full"></div>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 font-cinzel text-white">REJOINDRE LE RANG</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-lg font-light italic">
                Devenez une étoile dans notre galaxie. L'adhésion est le premier pas vers l'infini.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-16 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden">
              <div className="flex justify-between mb-16 relative px-4">
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 -translate-y-1/2 z-0"></div>
                {['Infos', 'Paiement', 'Validation', 'Carte'].map((s, i) => {
                  const currentIdx = ['form', 'payment', 'validation', 'card'].indexOf(step);
                  const isActive = i <= currentIdx;
                  return (
                    <div key={s} className="relative z-10 flex flex-col items-center gap-3">
                      <motion.div 
                        initial={false}
                        animate={{ 
                          backgroundColor: isActive ? 'rgba(29, 78, 216, 1)' : 'rgba(15, 23, 42, 1)',
                          borderColor: isActive ? 'rgba(96, 165, 250, 1)' : 'rgba(255, 255, 255, 0.1)',
                          scale: isActive ? 1.1 : 1
                        }}
                        className="w-12 h-12 rounded-full flex items-center justify-center border-2 text-white font-bold transition-all duration-500"
                      >
                        {i < currentIdx ? <CheckCircle size={22} /> : i + 1}
                      </motion.div>
                      <span className={`text-[9px] uppercase tracking-[0.2em] font-bold ${isActive ? 'text-white' : 'text-slate-600'}`}>{s}</span>
                    </div>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {step === 'form' && (
                  <motion.div key="form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 ml-2">Nom de famille</label>
                        <input type="text" name="nom" value={formData.nom} onChange={handleInputChange} placeholder="Ex: Traoré" className="w-full bg-slate-900/40 border border-white/10 rounded-2xl px-8 py-5 outline-none focus:border-blue-500 focus:bg-slate-900/60 transition-all text-white placeholder:text-slate-700" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 ml-2">Prénoms</label>
                        <input type="text" name="prenom" value={formData.prenom} onChange={handleInputChange} placeholder="Ex: Ahmed" className="w-full bg-slate-900/40 border border-white/10 rounded-2xl px-8 py-5 outline-none focus:border-blue-500 focus:bg-slate-900/60 transition-all text-white placeholder:text-slate-700" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 ml-2">Numéro de CNIB</label>
                      <input type="text" name="cnib" value={formData.cnib} onChange={handleInputChange} placeholder="Référence de votre pièce d'identité" className="w-full bg-slate-900/40 border border-white/10 rounded-2xl px-8 py-5 outline-none focus:border-blue-500 focus:bg-slate-900/60 transition-all text-white placeholder:text-slate-700" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 ml-2">Cursus Éducatif</label>
                      <input type="text" name="cursus" value={formData.cursus} onChange={handleInputChange} placeholder="Diplômes, universités, parcours..." className="w-full bg-slate-900/40 border border-white/10 rounded-2xl px-8 py-5 outline-none focus:border-blue-500 focus:bg-slate-900/60 transition-all text-white placeholder:text-slate-700" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 ml-2">Résumé du parcours (CV)</label>
                      <textarea name="cvSummary" rows={5} value={formData.cvSummary} onChange={handleInputChange} placeholder="Décrivez brièvement vos ambitions et vos expériences marquantes..." className="w-full bg-slate-900/40 border border-white/10 rounded-2xl px-8 py-5 outline-none focus:border-blue-500 focus:bg-slate-900/60 transition-all text-white placeholder:text-slate-700 resize-none" />
                    </div>
                    <button onClick={nextStep} className="w-full py-6 bg-blue-700 hover:bg-blue-600 text-white rounded-2xl font-bold tracking-[0.3em] text-sm shadow-2xl shadow-blue-900/30 transition-all flex items-center justify-center gap-4 group">
                      PASSER AU PAIEMENT <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                )}

                {step === 'payment' && (
                  <motion.div key="payment" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="text-center space-y-10">
                    <div className="w-28 h-28 bg-orange-600/10 text-orange-500 rounded-full flex items-center justify-center mx-auto border border-orange-500/20 shadow-inner">
                      <CreditCard size={56} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-3 font-cinzel">SÉCURISATION DES DROITS</h3>
                      <p className="text-slate-500 max-w-md mx-auto">Veuillez effectuer le dépôt via Orange Money pour finaliser votre admission au club.</p>
                    </div>
                    <div className="p-10 bg-slate-900/80 rounded-[2rem] border border-white/5 space-y-6 relative overflow-hidden text-left">
                      <div className="absolute top-0 left-0 w-2 h-full bg-orange-600" />
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 uppercase tracking-[0.2em] text-[10px] font-bold">Frais d'Adhésion</span>
                        <span className="text-4xl font-bold text-white tracking-tighter">{PAYMENT_DETAILS.amount}</span>
                      </div>
                      <div className="pt-8">
                        <span className="block text-[10px] text-slate-500 uppercase tracking-[0.4em] mb-4">Numéro de transfert officiel</span>
                        <div className="text-5xl font-mono font-bold text-orange-500 tracking-tighter bg-slate-950 p-6 rounded-2xl border border-white/5 text-center">
                          {PAYMENT_DETAILS.number}
                        </div>
                      </div>
                    </div>
                    <button onClick={nextStep} className="w-full py-6 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold tracking-[0.3em] text-sm shadow-2xl shadow-orange-900/20 transition-all uppercase">
                      Transfert effectué avec succès
                    </button>
                  </motion.div>
                )}

                {step === 'validation' && (
                  <motion.div key="validation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="text-center space-y-10">
                    <div className="w-28 h-28 bg-blue-600/10 text-blue-500 rounded-full flex items-center justify-center mx-auto border border-blue-500/20"><Phone size={56} className="animate-pulse" /></div>
                    <div>
                      <h3 className="text-3xl font-bold mb-4 font-cinzel tracking-wide">CONFIRMATION DIRECTE</h3>
                      <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">Pour l'activation immédiate de vos privilèges, veuillez contacter notre administrateur.</p>
                    </div>
                    <div className="py-8 px-6 bg-blue-900/10 border border-blue-500/20 rounded-[2rem] group hover:bg-blue-900/20 transition-all duration-500">
                      <a href={`tel:${PAYMENT_DETAILS.number}`} className="text-4xl font-bold text-blue-400 hover:text-white flex items-center justify-center gap-4 transition-colors"><Phone fill="currentColor" size={32} />{PAYMENT_DETAILS.number}</a>
                    </div>
                    <button onClick={nextStep} className="w-full py-6 bg-white text-blue-900 hover:bg-blue-50 rounded-2xl font-bold tracking-[0.3em] text-sm transition-all uppercase shadow-xl">Ma transaction est validée</button>
                  </motion.div>
                )}

                {step === 'card' && (
                  <motion.div key="card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 mb-6"><CheckCircle size={40} /></div>
                      <h3 className="text-3xl font-bold font-cinzel text-white mb-2 uppercase tracking-widest">Bienvenue Bâtisseur</h3>
                      <p className="text-slate-500">Votre destin est désormais lié aux étoiles de la Stratosphère.</p>
                    </div>
                    
                    <div className="relative group overflow-visible">
                      <motion.div 
                        ref={cardRef}
                        id="membership-card" 
                        className="relative w-full aspect-[1.6/1] rounded-[2.5rem] overflow-hidden border border-white/20 shadow-[0_40px_100px_rgba(0,0,0,0.6)] bg-slate-900"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#002855] via-slate-900 to-indigo-950"></div>
                        <div className="relative h-full p-10 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10"><span className="font-cinzel text-sm font-bold text-white">S</span></div>
                              <span className="font-cinzel text-lg tracking-[0.3em] font-bold text-white">STRATOSPHÈRE</span>
                            </div>
                            <div className="text-sm font-mono font-bold tracking-widest text-blue-400">#STRATO-2024-X91</div>
                          </div>
                          <div className="flex items-end justify-between">
                            <div className="space-y-6">
                              <h4 className="text-3xl font-cinzel font-bold text-white uppercase tracking-widest">{formData.nom || 'NOM'} <span className="text-blue-500">{formData.prenom || 'PRÉNOM'}</span></h4>
                              <div className="text-xs font-bold text-white tracking-widest uppercase">Bâtisseur d'élite • Club Privé</div>
                              <div className="text-[8px] text-slate-500 uppercase tracking-widest">ID CNIB: {formData.cnib || 'XXXXXXXX'}</div>
                            </div>
                            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center"><Globe size={40} className="text-blue-600/40" /></div>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={downloadCard} 
                        disabled={isDownloading}
                        className="flex-1 py-5 bg-blue-700 hover:bg-blue-600 text-white border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Génération...
                          </>
                        ) : (
                          <>
                            <Download size={20} />
                            Télécharger l'image
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => window.print()} 
                        className="flex-1 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all"
                      >
                        <FileText size={20} />
                        Imprimer PDF
                      </button>
                    </div>
                    <button onClick={() => window.location.reload()} className="w-full py-5 text-slate-500 hover:text-white transition-colors text-xs uppercase tracking-[0.2em] font-bold">Retour à l'accueil</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-24 px-6 md:px-20 bg-slate-950 border-t border-white/5 relative">
          <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-16">
            <div className="col-span-2 space-y-8">
               <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-tr from-blue-900 to-[#002855] rounded-full flex items-center justify-center border border-white/10"><span className="font-cinzel font-bold text-2xl">S</span></div>
                <h3 className="font-cinzel text-2xl font-bold tracking-[0.3em]">LA STRATOSPHÈRE</h3>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed text-lg font-light">Une alliance de bâtisseurs dévoués à la grandeur, incarnant les valeurs d'honneur et de discipline.</p>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-cinzel font-bold text-xs tracking-[0.3em] text-blue-500 uppercase">Architecture</h4>
              <ul className="text-slate-500 space-y-3 text-sm font-light">
                <li><a href="#about" className="hover:text-white transition-colors">Notre Vision</a></li>
                <li><button onClick={openGovernanceModal} className="hover:text-white transition-colors">Gouvernance</button></li>
                <li><button onClick={openProjectsModal} className="hover:text-white transition-colors">Projets Stellaires</button></li>
                <li><a href="#join" className="hover:text-white transition-colors">Clubs Stratosphères</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-cinzel font-bold text-xs tracking-[0.3em] text-blue-500 uppercase">Siège Social</h4>
              <ul className="text-slate-500 space-y-4 text-sm font-light">
                <li className="flex items-start gap-3"><Globe size={16} className="text-blue-500 shrink-0 mt-1" /><span>Bobo Dioulasso, <br />Burkina Faso</span></li>
                <li className="flex items-center gap-3"><Phone size={16} className="text-blue-500 shrink-0" /><span>+226 {PAYMENT_DETAILS.number}</span></li>
              </ul>
            </div>
          </div>
          
          <div className="max-w-6xl mx-auto mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] tracking-[0.4em] text-slate-700 font-bold uppercase">
            <p>© 2024 LA STRATOSPHÈRE</p>
            <div className="flex gap-10">
              <button onClick={() => openLegalModal('privacy')} className="hover:text-white transition-colors">Confidentialité</button>
              <button onClick={() => openLegalModal('terms')} className="hover:text-white transition-colors">Conditions d'accès</button>
            </div>
          </div>
        </footer>
      </main>

      {/* MODALS */}
      <Modal isOpen={!!activeEntity} onClose={() => setActiveEntity(null)} title={activeEntity?.name || ''}>
        <div className="space-y-8">
          <div className={`p-6 rounded-3xl bg-gradient-to-br ${activeEntity?.color} bg-opacity-10 border border-white/5`}>
            <p className="text-white text-lg font-bold mb-4">Objectif Stratégique</p>
            <p>{activeEntity?.description}</p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-cinzel text-sm tracking-widest uppercase">Expertises</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs">Innovation Continue</div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs">Structuration Agile</div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs">Impact Global</div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs">Noblesse d'Action</div>
            </div>
          </div>
          <button onClick={() => { setActiveEntity(null); document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' }); }} className="w-full py-4 bg-blue-700 text-white rounded-xl font-bold uppercase text-xs tracking-widest mt-8">S'INSCRIRE VIA CETTE ENTITÉ</button>
        </div>
      </Modal>

      <Modal isOpen={!!modalContent} onClose={() => setModalContent(null)} title={modalContent?.title || ''}>
        {modalContent?.content}
      </Modal>
    </div>
  );
};

export default App;
