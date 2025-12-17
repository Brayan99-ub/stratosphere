
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ChevronRight, Calendar, TrendingUp, Smartphone, Zap, Globe, Users, CreditCard,
  Phone, Download, CheckCircle, Menu, X, ArrowRight, Shield, Star, ExternalLink,
  Lock, FileText, Loader2, LogIn, LogOut
} from 'lucide-react';
import html2canvas from 'html2canvas';

// Firebase imports
import { auth, firestore, provider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

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

  const [user, setUser] = useState<User | null>(null);
  
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(firestore, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data() as FormData;
          setFormData(userData);
          if (userData.cnib) { // If user has already filled the form
            setStep('card');
          }
        } else {
          // Pre-fill form for new user from Google account
          const [nom = '', ...prenomParts] = (currentUser.displayName || '').split(' ');
          setFormData(prev => ({ ...prev, nom, prenom: prenomParts.join(' ') }));
          setStep('form');
        }
      } else {
        setUser(null);
        // Reset form and step when user logs out
        setFormData({ nom: '', prenom: '', cnib: '', cursus: '', cvSummary: '' });
        setStep('form');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the rest
    } catch (error) {
      console.error("Erreur de connexion:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged will handle the rest
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = async () => {
    if (step === 'form') {
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, formData, { merge: true }); // Save data to Firestore
      }
      setStep('payment');
    }
    else if (step === 'payment') setStep('validation');
    else if (step === 'validation') setStep('card');
  };

  const downloadCard = async () => {
    if (!cardRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: null, useCORS: true, logging: false });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Carte-Strato-${formData.nom.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const openLegalModal = (type: 'privacy' | 'terms') => {
    setModalContent({
      title: type === 'privacy' ? "Confidentialité" : "Conditions d'Accès",
      content: type === 'privacy' ? (
        <div className="space-y-6">
          <p>La Stratosphere s'engage à protéger l'intégrité et la confidentialité des données de ses bâtisseurs. Vos informations (CNIB, CV) ne sont utilisées que pour le processus d'accréditation interne.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Stockage sécurisé sur serveurs décentralisés.</li>
            <li>Aucun partage avec des tiers sans consentement explicite.</li>
            <li>Droit de rectification immédiat via l'administrateur.</li>
          </ul>
        </div>
      ) : (
        <div className="space-y-6">
          <p>L'accès à la Stratosphère exige l'adhésion aux valeurs fondamentales : Honneur, Discipline, Respect.</p>
          <p>Tout manquement aux codes de conduite du Club peut entraîner une révocation immédiate de la carte de membre sans remboursement.</p>
          <p>Le paiement de 12 500 FCFA constitue un droit d'entrée perpétuel sauf infraction grave.</p>
        </div>
      )
    });
  };

  const openGovernanceModal = () => setModalContent({
    title: "Gouvernance",
    content: <p>Gouvernance details...</p> 
  });
  
  const openProjectsModal = () => setModalContent({
    title: "Projets Stellaires",
    content: <p>Project details...</p>
  });

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
          {user ? (
            <button 
              onClick={handleSignOut}
              className="px-6 py-2 bg-red-700 text-white hover:bg-white hover:text-red-900 transition-all duration-300 rounded-full font-bold shadow-lg shadow-red-900/40 flex items-center gap-2"
            >
              <LogOut size={16} /> DÉCONNEXION
            </button>
          ) : (
            <button 
              onClick={handleSignIn}
              className="px-6 py-2 bg-blue-700 text-white hover:bg-white hover:text-blue-900 transition-all duration-300 rounded-full font-bold shadow-lg shadow-blue-900/40 flex items-center gap-2"
            >
              <LogIn size={16} /> CONNEXION
            </button>
          )}
        </div>

        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu & Auth */}
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
             {user ? (
                <button onClick={() => {setIsMenuOpen(false); handleSignOut();}} className="text-red-500">DÉCONNEXION</button>
             ) : (
                <button onClick={() => {setIsMenuOpen(false); handleSignIn();}} className="text-blue-500">CONNEXION</button>
             )}
          </motion.div>
        )}
      </AnimatePresence>

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

        {/* ... (rest of your sections remain the same) ... */}

        {/* REGISTRATION & PAYMENT FLOW */}
        <section id="join" className="min-h-screen py-32 px-6 md:px-20 relative overflow-hidden bg-gradient-to-b from-slate-950 to-[#00122e]">
          <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full"></div>
          <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full"></div>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 font-cinzel text-white">REJOINDRE LE RANG</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-lg font-light italic">
                {user ? `Bienvenue, ${user.displayName}. Finalisez votre inscription.` : "Devenez une étoile dans notre galaxie. L'adhésion est le premier pas vers l'infini."}
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-16 shadow-[0_0_80px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden">
             {!user && (
                 <div className="absolute inset-0 bg-slate-900/80 z-20 flex flex-col items-center justify-center rounded-[3rem]">
                    <p className="text-2xl font-cinzel mb-8 text-center">Veuillez vous connecter pour continuer</p>
                    <button 
                        onClick={handleSignIn}
                        className="px-8 py-4 bg-blue-700 text-white hover:bg-white hover:text-blue-900 transition-all duration-300 rounded-full font-bold shadow-lg shadow-blue-900/40 flex items-center gap-3 text-lg"
                        >
                        <LogIn size={20} /> CONNEXION AVEC GOOGLE
                    </button>
                 </div>
             )}
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
                     <p>Payment step...</p>
                     <button onClick={nextStep} className="w-full py-6 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold tracking-[0.3em] text-sm shadow-2xl shadow-orange-900/20 transition-all uppercase">
                      Transfert effectué avec succès
                    </button>
                  </motion.div>
                )}

                {step === 'validation' && (
                  <motion.div key="validation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="text-center space-y-10">
                     <p>Validation step...</p>
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
                    
                    <div ref={cardRef} id="membership-card">
                       {/* Card content from your original code */}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button onClick={downloadCard} disabled={isDownloading} className="flex-1 ...">
                         {isDownloading ? 'Génération...' : 'Télécharger l'image' }
                      </button>
                      <button onClick={() => window.print()} className="flex-1 ...">
                        Imprimer PDF
                      </button>
                    </div>
                    <button onClick={handleSignOut} className="w-full py-5 text-slate-500 hover:text-white transition-colors text-xs uppercase tracking-[0.2em] font-bold">Se déconnecter</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ... (rest of your components) ... */}

      </main>

      <Modal isOpen={!!activeEntity} onClose={() => setActiveEntity(null)} title={activeEntity?.name || ''}>
        {/* Modal content */}
      </Modal>

      <Modal isOpen={!!modalContent} onClose={() => setModalContent(null)} title={modalContent?.title || ''}>
        {modalContent?.content}
      </Modal>
    </div>
  );
};

export default App;
