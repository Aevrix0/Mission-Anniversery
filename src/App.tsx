/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Heart, Gift, Sparkles, Star, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

type Stage = 'CAKE' | 'EATEN' | 'GIFT_DROPPING' | 'GIFT_LANDED' | 'REVEAL';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

interface Petal {
  id: number;
  left: string;
  duration: number;
  delay: number;
  size: number;
  rotation: number;
  color: string;
}

export default function App() {
  const [stage, setStage] = useState<Stage>('CAKE');
  const [clicks, setClicks] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [cursorSparkles, setCursorSparkles] = useState<Particle[]>([]);
  const controls = useAnimation();
  const totalClicks = 3;

  // Initialize petals with more variety
  useEffect(() => {
    const petalColors = ['#fbcfe8', '#f9a8d4', '#f472b6', '#fff1f2'];
    const newPetals = [...Array(40)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 15,
      size: 8 + Math.random() * 18,
      rotation: Math.random() * 360,
      color: petalColors[Math.floor(Math.random() * petalColors.length)]
    }));
    setPetals(newPetals);
  }, []);

  // Cursor sparkle effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (Math.random() > 0.8) {
      const id = Date.now() + Math.random();
      const newSparkle = {
        id,
        x: e.clientX,
        y: e.clientY,
        color: '#fdf2f8',
        size: 4 + Math.random() * 6
      };
      setCursorSparkles(prev => [...prev.slice(-20), newSparkle]);
      setTimeout(() => {
        setCursorSparkles(prev => prev.filter(s => s.id !== id));
      }, 800);
    }
  };

  const handleEatSlice = (e: React.MouseEvent) => {
    if (stage !== 'CAKE' || clicks >= totalClicks) return;
    
    const nextClicks = clicks + 1;
    setClicks(nextClicks);

    // Visual feedback: Crumbs/Sparkles at click position
    const newParticles = [...Array(15)].map((_, i) => ({
      id: Date.now() + i,
      x: e.clientX,
      y: e.clientY,
      color: ['#f472b6', '#fb7185', '#ffffff', '#fce7f3', '#fdf2f8'][Math.floor(Math.random() * 5)],
      size: 6 + Math.random() * 8
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);

    // Screen Shake
    controls.start({
      x: [0, -12, 12, -12, 12, 0],
      y: [0, 5, -5, 5, -5, 0],
      transition: { duration: 0.4 }
    });
    
    if (nextClicks >= totalClicks) {
      setTimeout(() => {
        setStage('EATEN');
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ff69b4', '#ff1493', '#ffffff', '#fdf2f8'],
          scalar: 1.2
        });
        setTimeout(() => {
          setStage('GIFT_DROPPING');
        }, 1200);
      }, 600);
    }
  };

  const handleOpenGift = () => {
    if (stage === 'GIFT_LANDED') {
      setStage('REVEAL');
      celebrate();
    }
  };

  const celebrate = useCallback(() => {
    const duration = 12 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 50, spread: 360, ticks: 120, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 100 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      
      confetti({
        ...defaults,
        particleCount: 15,
        shapes: ['circle'],
        colors: ['#ff0000', '#ff69b4', '#ffffff'],
        origin: { x: Math.random(), y: Math.random() - 0.2 }
      });
    }, 300);
  }, []);

  return (
    <motion.div 
      animate={controls}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full romantic-gradient flex flex-col items-center justify-center overflow-hidden font-serif cursor-none"
    >
      {/* Custom Cursor Sparkles */}
      <AnimatePresence>
        {cursorSparkles.map(s => (
          <motion.div
            key={s.id}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0, y: s.y + 20 }}
            exit={{ opacity: 0 }}
            className="fixed pointer-events-none z-[1000]"
            style={{ left: s.x, top: s.y }}
          >
            <Sparkles size={s.size} className="text-pink-300 fill-white" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Falling Petals */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {petals.map(petal => (
          <motion.div
            key={petal.id}
            initial={{ y: -50, x: petal.left, opacity: 0, rotate: petal.rotation }}
            animate={{ 
              y: '110vh', 
              x: `calc(${petal.left} + ${Math.sin(petal.id + Date.now()/2000) * 150}px)`,
              opacity: [0, 0.8, 0.8, 0],
              rotate: petal.rotation + 1080
            }}
            transition={{ 
              duration: petal.duration, 
              repeat: Infinity, 
              delay: petal.delay,
              ease: "linear"
            }}
            className="absolute"
          >
            <div 
              style={{ 
                width: petal.size, 
                height: petal.size * 1.3, 
                backgroundColor: petal.color,
                borderRadius: '60% 10% 60% 60%',
                boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.08)',
                transform: 'skewX(-10deg)'
              }} 
            />
          </motion.div>
        ))}
      </div>

      {/* Background Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: '110vh', x: `${Math.random() * 100}vw`, opacity: 0 }}
            animate={{ 
              y: '-10vh', 
              opacity: [0, 0.5, 0],
              rotate: [0, 180, -180, 0],
              scale: [0.4, 1.2, 0.4]
            }}
            transition={{ 
              duration: 15 + Math.random() * 25, 
              repeat: Infinity, 
              delay: Math.random() * 15 
            }}
            className="absolute text-pink-200/40"
          >
            {i % 3 === 0 ? <Heart size={25 + Math.random() * 35} fill="currentColor" /> : 
             i % 3 === 1 ? <Star size={20 + Math.random() * 25} fill="currentColor" /> :
             <Sparkles size={15 + Math.random() * 20} fill="currentColor" />}
          </motion.div>
        ))}
      </div>

      {/* Click Particles */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, scale: 1, opacity: 1 }}
            animate={{ 
              x: p.x + (Math.random() - 0.5) * 400, 
              y: p.y + (Math.random() - 0.5) * 400, 
              scale: 0, 
              opacity: 0,
              rotate: Math.random() * 720
            }}
            exit={{ opacity: 0 }}
            className="fixed z-[60] pointer-events-none"
            style={{ backgroundColor: p.color, width: p.size, height: p.size, borderRadius: '50%' }}
          />
        ))}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center w-full px-4">
        
        {/* Table */}
        <div className="relative mt-24 md:mt-32 w-full flex justify-center">
          <motion.div 
            initial={{ scale: 0.7, opacity: 0, y: 150 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-[92vw] max-w-[650px] h-[130px] md:h-[200px] bg-white rounded-[100%] shadow-[0_40px_70px_-20px_rgba(0,0,0,0.35)] border-b-[10px] md:border-b-[15px] border-gray-200 flex items-center justify-center relative"
          >
            {/* Table Cloth Detail */}
            <div className="absolute inset-3 md:inset-6 border-2 border-dashed border-pink-100 rounded-[100%] opacity-50" />
            
            {/* Cake Stage */}
            <AnimatePresence mode="wait">
              {stage === 'CAKE' && (
                <motion.div
                  key="cake"
                  exit={{ scale: 0, opacity: 0, rotate: 90, y: 100 }}
                  className="absolute -top-56 md:-top-80 cursor-pointer select-none"
                  onClick={handleEatSlice}
                >
                  <LineArtCake clicks={clicks} />
                  <motion.div 
                    animate={{ y: [0, -12, 0], scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                    className="absolute -top-20 md:-top-24 left-1/2 -translate-x-1/2 text-pink-600 font-cursive text-3xl md:text-5xl whitespace-nowrap drop-shadow-lg text-center px-4"
                  >
                    Click to Celebrate!
                  </motion.div>
                </motion.div>
              )}

              {/* Gift Stage */}
              {(stage === 'GIFT_DROPPING' || stage === 'GIFT_LANDED') && (
                <motion.div
                  key="gift"
                  initial={{ y: -1200, rotate: -60, scale: 0.4 }}
                  animate={{ 
                    y: -70, 
                    rotate: 0,
                    scale: 1.1,
                    transition: { 
                      type: 'spring', 
                      damping: 12, 
                      stiffness: 90,
                      onComplete: () => setStage('GIFT_LANDED')
                    } 
                  }}
                  whileHover={{ scale: 1.2, rotate: [0, -8, 8, 0] }}
                  className="absolute cursor-pointer gift-drop"
                  onClick={handleOpenGift}
                >
                  <GiftBox />
                  {stage === 'GIFT_LANDED' && (
                    <motion.div 
                      animate={{ scale: [1, 1.25, 1], y: [0, -15, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="absolute -top-24 left-1/2 -translate-x-1/2 text-pink-600 font-cursive text-4xl md:text-6xl whitespace-nowrap drop-shadow-xl"
                    >
                      Open Surprise!
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Reveal Screen */}
        <AnimatePresence>
          {stage === 'REVEAL' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[1000] flex items-center justify-center bg-white/98 backdrop-blur-xl p-4 overflow-y-auto"
            >
              <motion.div 
                initial={{ scale: 0.4, rotate: -15, y: 100 }}
                animate={{ scale: 1, rotate: 0, y: 0 }}
                transition={{ type: 'spring', bounce: 0.6, duration: 1.2 }}
                className="text-center relative py-12 px-6 max-w-5xl"
              >
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
                  className="absolute -inset-16 md:-inset-32 border-8 border-dashed border-pink-100 rounded-full opacity-40 pointer-events-none"
                />

                <motion.div
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="relative z-10"
                >
                  <h1 className="text-6xl sm:text-8xl md:text-[12rem] font-cursive text-pink-600 mb-6 md:mb-12 leading-tight drop-shadow-[0_10px_20px_rgba(219,39,119,0.2)]">
                    Happy Anniversary
                  </h1>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col items-center gap-6 md:gap-10"
                  >
                    <div className="flex items-center justify-center gap-6 md:gap-16 w-full">
                      <div className="hidden sm:block h-1.5 flex-1 bg-gradient-to-r from-transparent to-pink-500 rounded-full" />
                      <h2 className="text-4xl sm:text-6xl md:text-9xl text-pink-500 font-light tracking-[0.15em] md:tracking-[0.25em] uppercase drop-shadow-sm">
                        Papa & Mummy
                      </h2>
                      <div className="hidden sm:block h-1.5 flex-1 bg-gradient-to-l from-transparent to-pink-500 rounded-full" />
                    </div>
                    
                    <p className="text-pink-400 text-xl md:text-4xl font-light italic mt-4 tracking-wide">
                      A lifetime of love, a world of happiness
                    </p>
                  </motion.div>
                </motion.div>

                <div className="mt-12 md:mt-24 flex justify-center gap-6 md:gap-12">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        y: [0, -40, 0],
                        scale: [1, 1.6, 1],
                        opacity: [0.3, 1, 0.3],
                        rotate: [0, 15, -15, 0]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 3, 
                        delay: i * 0.5 
                      }}
                    >
                      <Heart className="text-pink-500 fill-pink-500" size={i % 2 === 0 ? 48 : 36} />
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: '#db2777', boxShadow: '0 20px 40px rgba(219,39,119,0.3)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setStage('CAKE');
                    setClicks(0);
                  }}
                  className="mt-16 md:mt-28 px-10 md:px-16 py-4 md:py-7 bg-pink-500 text-white rounded-full text-2xl md:text-3xl font-bold shadow-2xl flex items-center gap-4 mx-auto transition-all"
                >
                  <Heart fill="white" size={28} /> Celebrate Again
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Text */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 md:bottom-12 text-pink-400 text-sm md:text-xl tracking-[0.3em] md:tracking-[0.5em] uppercase font-light text-center px-4 opacity-70"
      >
        Celebrating the Best Parents in the World
      </motion.div>

      {/* Custom Cursor */}
      <motion.div
        className="fixed w-8 h-8 pointer-events-none z-[2000] mix-blend-difference"
        animate={{
          x: -16,
          y: -16,
          scale: [1, 1.2, 1],
        }}
        transition={{ repeat: Infinity, duration: 1 }}
        style={{ left: 'var(--mouse-x)', top: 'var(--mouse-y)' }}
      >
        <div className="w-full h-full bg-white rounded-full opacity-50" />
      </motion.div>
      <style>{`
        :root {
          --mouse-x: 0px;
          --mouse-y: 0px;
        }
      `}</style>
      <script>{`
        window.addEventListener('mousemove', (e) => {
          document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
          document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
        });
      `}</script>
    </motion.div>
  );
}

function LineArtCake({ clicks }: { clicks: number }) {
  // We want to eat from top to bottom
  const isTopEaten = clicks >= 1;
  const isMiddleEaten = clicks >= 2;
  const isBottomEaten = clicks >= 3;

  return (
    <div className="relative w-72 h-80 md:w-96 md:h-[450px] flex flex-col items-center justify-end">
      {/* Cake Shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-10 md:h-16 bg-black/10 rounded-[100%] blur-xl" />
      
      {/* Line Art Cake Structure */}
      <div className="relative w-full h-full flex flex-col items-center justify-end">
        
        {/* Tiers Container */}
        <div className="relative w-full h-[85%] flex flex-col items-center justify-end">
          
          {/* TOP TIER (Smallest) */}
          <div className="relative w-32 h-16 md:w-48 md:h-24 z-20">
            <CakeTier eaten={isTopEaten} delay={0} color="#f9a8d4" outlineColor="#1a1a1a">
                <div className="absolute top-0 left-0 w-full flex">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-full h-6 md:h-10 bg-pink-300/60 rounded-b-full mx-1 border-b-2 border-black/10" />
                  ))}
                </div>
            </CakeTier>
          </div>

          {/* MIDDLE TIER (Medium) */}
          <div className="relative w-48 h-20 md:w-64 md:h-28 -mt-2 z-10">
            <CakeTier eaten={isMiddleEaten} delay={0.1} color="#fbcfe8" outlineColor="#1a1a1a">
                <div className="absolute top-0 left-0 w-full flex">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-full h-8 md:h-12 bg-pink-200/60 rounded-b-full mx-1 border-b-2 border-black/10" />
                  ))}
                </div>
            </CakeTier>
          </div>

          {/* BOTTOM TIER (Largest) */}
          <div className="relative w-64 h-24 md:w-80 md:h-32 -mt-2 z-0">
             <CakeTier eaten={isBottomEaten} delay={0.2} color="#fce7f3" outlineColor="#1a1a1a">
                {/* Drip Effect */}
                <div className="absolute top-0 left-0 w-full flex">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-full h-10 md:h-14 bg-pink-100/60 rounded-b-full mx-1 border-b-2 border-black/10" />
                  ))}
                </div>
             </CakeTier>
          </div>
        </div>

        {/* Candles on Top */}
        <AnimatePresence>
          {!isTopEaten && (
            <motion.div 
              exit={{ y: -150, opacity: 0, scale: 0 }}
              className="absolute -top-12 md:-top-20 left-1/2 -translate-x-1/2 flex gap-3 md:gap-5 z-30"
            >
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      filter: ['blur(0px)', 'blur(4px)', 'blur(0px)']
                    }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                    className="relative"
                  >
                    <Flame className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" size={24} md:size={32} />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-yellow-400/20 rounded-full blur-md" />
                  </motion.div>
                  <div className="w-1.5 h-8 md:w-2 md:h-12 bg-white border-2 border-black rounded-full" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CakeTier({ eaten, children, color, outlineColor, delay }: { eaten: boolean; children: React.ReactNode; color: string; outlineColor: string; delay: number }) {
  return (
    <motion.div
      initial={false}
      animate={{ 
        opacity: eaten ? 0 : 1,
        scale: eaten ? 0.7 : 1,
        y: eaten ? 40 : 0,
        rotate: eaten ? (Math.random() > 0.5 ? 10 : -10) : 0,
        filter: eaten ? 'blur(15px)' : 'blur(0px)'
      }}
      transition={{ duration: 0.6, delay, type: 'spring', damping: 15 }}
      className="w-full h-full relative"
    >
      {/* Line Art Body */}
      <div 
        className="w-full h-full border-4 border-black rounded-t-[40%] relative overflow-hidden shadow-lg"
        style={{ backgroundColor: color }}
      >
        {children}
        {/* Line Art Detail - Internal Curves */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 50 Q 25 40, 50 50 T 100 50" fill="none" stroke="black" strokeWidth="2" />
          <path d="M0 70 Q 25 60, 50 70 T 100 70" fill="none" stroke="black" strokeWidth="2" />
        </svg>
      </div>
      
      {/* Sparkle effect when eaten */}
      {eaten && (
        <div className="absolute inset-0 flex items-center justify-center">
           <Sparkles className="text-pink-400 animate-ping" size={50} />
        </div>
      )}
    </motion.div>
  );
}

function GiftBox() {
  return (
    <div className="relative w-40 h-40 md:w-56 md:h-56">
      <motion.div 
        animate={{ rotate: [0, -3, 3, 0], scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="w-full h-full bg-pink-500 rounded-3xl shadow-2xl relative overflow-hidden border-4 md:border-6 border-black"
      >
        {/* Ribbon Vertical */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-10 md:w-14 h-full bg-white border-x-4 border-black shadow-sm" />
        {/* Ribbon Horizontal */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-10 md:h-14 bg-white border-y-4 border-black shadow-sm" />
        
        {/* Sparkles */}
        <div className="absolute inset-0">
          <Sparkles className="absolute top-6 left-6 text-white/50" size={28} md:size={40} />
          <Sparkles className="absolute bottom-8 right-8 text-white/50" size={36} md:size={48} />
          <Star className="absolute top-1/2 left-6 text-white/30" size={20} />
        </div>
      </motion.div>
      
      {/* Bow */}
      <div className="absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2 flex z-10">
        <motion.div 
          animate={{ scale: [1, 1.15, 1], rotate: [-45, -40, -45] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="w-20 h-20 md:w-28 md:h-28 border-6 md:border-8 border-black bg-white rounded-full -mr-6 shadow-xl" 
          style={{ borderRadius: '50% 50% 0 50%' }}
        />
        <motion.div 
          animate={{ scale: [1, 1.15, 1], rotate: [45, 40, 45] }}
          transition={{ repeat: Infinity, duration: 1.8, delay: 0.3 }}
          className="w-20 h-20 md:w-28 md:h-28 border-6 md:border-8 border-black bg-white rounded-full -ml-6 shadow-xl" 
          style={{ borderRadius: '50% 50% 50% 0' }}
        />
      </div>
    </div>
  );
}
