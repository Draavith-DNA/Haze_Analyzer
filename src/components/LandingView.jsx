import { useEffect, useRef, useState } from 'react';

function LandingView({ onEnterDashboard }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  // Interactive Particle Network Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse coordinates
    const mouse = { x: null, y: null, radius: 150 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle class definition
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2.5 + 1;
        this.baseColor = Math.random() > 0.45 ? '#5af0b3' : '#ffc640'; // Emerald and Amber particles
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce on boundaries
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Interaction with mouse (push particles away gently)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 2;
            this.y += Math.sin(angle) * force * 2;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.baseColor;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.baseColor;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow for lines
      }
    }

    // Initialize particles
    const particleCount = Math.min(100, Math.floor((width * height) / 12000));
    const particles = Array.from({ length: particleCount }, () => new Particle());

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background network grid lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update();
        p1.draw();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            // Opacity fades as distance increases
            const alpha = ((120 - dist) / 120) * 0.15;
            ctx.strokeStyle = `rgba(90, 240, 179, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleOpenModal = () => {
    setShowModal(true);
    setErrors({});
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onEnterDashboard({ name, email });
  };

  return (
    <div ref={containerRef} className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      {/* Background Interactive Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-60" />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Main UI Hero Content */}
      <div className="z-10 text-center px-6 max-w-2xl mx-auto flex flex-col items-center space-y-6">
        
        {/* Sleek Badge */}
        <div className="flex items-center gap-2 px-3 py-1 bg-surface-container/50 border border-outline-variant/30 rounded-full backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[9px] font-bold text-primary tracking-widest uppercase">
            AeroSight Neural Engine v2.0
          </span>
        </div>

        {/* Striking Minimalist Headline */}
        <h1 className="font-headline text-4xl sm:text-6xl font-extrabold tracking-tighter text-on-background leading-none select-none">
          Understand the <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-primary via-secondary to-[#ffa668] bg-clip-text text-transparent">
            Air You Breathe
          </span>
        </h1>

        {/* Clean minimal description */}
        <p className="font-sans text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-lg select-none">
          Leverage localized neural networks, computer vision dark-prior channels, and live geo-sensing nodes to analyze haze density and predict air quality indexes instantly.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleOpenModal}
          className="group relative px-8 py-4 bg-primary text-on-primary font-bold rounded-lg overflow-hidden transition-all duration-300 transform active:scale-95 glow-emerald hover:bg-primary-container"
        >
          <span className="relative z-10 flex items-center gap-2">
            Predict Air Quality
            <span className="material-symbols-outlined text-sm font-bold group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </span>
        </button>

      </div>

      {/* Form Dialog Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-xl p-6 shadow-2xl relative border border-outline-variant/40">
            
            {/* Close Button */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <p className="font-mono text-[9px] font-bold text-primary uppercase tracking-widest mb-1">Telemetry Access Setup</p>
              <h3 className="font-headline text-xl font-bold tracking-tight text-on-surface">Enter Credentials</h3>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="font-mono text-label-caps text-on-surface-variant mb-1.5 block uppercase">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name" 
                  className={`w-full bg-surface-container border ${errors.name ? 'border-error' : 'border-outline-variant'} rounded-lg px-3.5 py-2.5 font-sans text-sm text-on-surface placeholder:text-on-surface-variant/45 focus:border-primary outline-none transition-colors`}
                />
                {errors.name && (
                  <p className="text-[10px] text-error font-mono mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">warning</span>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="font-mono text-label-caps text-on-surface-variant mb-1.5 block uppercase">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  className={`w-full bg-surface-container border ${errors.email ? 'border-error' : 'border-outline-variant'} rounded-lg px-3.5 py-2.5 font-sans text-sm text-on-surface placeholder:text-on-surface-variant/45 focus:border-primary outline-none transition-colors`}
                />
                {errors.email && (
                  <p className="text-[10px] text-error font-mono mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">warning</span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Submit / Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-on-primary py-3 rounded-lg font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-primary-container shadow-lg glow-emerald"
                >
                  <span className="material-symbols-outlined text-sm font-bold">lock_open</span>
                  Connect Dashboard
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 bg-surface-container-high border border-outline-variant/35 text-on-surface-variant py-3 rounded-lg font-semibold active:scale-95 transition-transform hover:bg-surface-variant"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingView;
