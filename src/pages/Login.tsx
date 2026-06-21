import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (email === 'correo@dkfitt.com' && password === '123456') {
        localStorage.setItem('auth_token', 'mock-token-nutritionist-123');
        navigate('/dashboard');
      } else {
        setError('Credenciales inválidas. Intente con correo@dkfitt.com / 123456');
      }
    } catch (err) {
      setError('Ocurrió un error en el servidor. Intente más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f7eed9] relative font-sans overflow-hidden">
      
      {/* Background Shapes EXACTLY matching the reference */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice">
        {/* Big Orange Shape top-left */}
        <path d="M0 0 H 900 C 900 150, 700 350, 0 650 Z" fill="#e88f21" />
        
        {/* Soft white cloud/blob on the right side */}
        <path d="M 1440 -100 C 1100 50, 950 400, 1440 850 Z" fill="#fdfbf7" opacity="0.6"/>
        <path d="M 1440 400 C 1250 550, 1200 800, 1440 1000 Z" fill="#fdfbf7" opacity="0.4"/>

        {/* Subtle Line Art Drawings mimicking fruits and leaves */}
        <g stroke="#d4ab71" strokeWidth="2" fill="none" opacity="0.5">
          {/* Banana shape top-right */}
          <path d="M1000 150 C1050 180, 1080 220, 1070 280 C1060 270, 1030 230, 980 220 Z" />
          <path d="M980 220 C990 200, 1000 150, 1000 150" />
          
          {/* Lemon / Orange shape middle-right */}
          <circle cx="1200" cy="400" r="25" />
          <path d="M1190 390 Q1200 400 1210 390" />
          
          {/* Leaf shapes */}
          <path d="M750 200 C780 180, 800 190, 800 220 C770 240, 750 230, 750 200 Z" />
          <path d="M750 200 L800 220" />
          
          <path d="M600 700 C640 680, 660 700, 650 740 C610 760, 590 740, 600 700 Z" />
          <path d="M600 700 L650 740" />

          {/* Another banana shape bottom-right */}
          <path d="M1150 750 C1120 780, 1100 830, 1120 880 C1140 860, 1160 820, 1180 800 Z" />
        </g>
      </svg>

      {/* Left Vertical Banner (Black) */}
      <div className="flex flex-col w-[320px] bg-[#111111] z-20 shadow-2xl h-screen shrink-0">
        {/* Logo Section */}
        <div className="pt-14 pb-8 flex flex-col items-center">
          {/* House with Barbell Logo */}
          <div className="w-14 h-14 text-[#eab308] flex items-center justify-center mb-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
              {/* House roof */}
              <path d="M2 10l10-8 10 8" />
              {/* Barbell in the middle */}
              <line x1="6" y1="14" x2="18" y2="14" strokeWidth="2" />
              <rect x="4" y="11" width="2" height="6" fill="currentColor" stroke="none" />
              <rect x="18" y="11" width="2" height="6" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <h1 className="text-white text-[22px] font-bold tracking-widest mt-1">DK Fitt</h1>
          <span className="text-[#a1a1aa] text-[10px] font-light tracking-[0.2em] uppercase mt-0.5">nutricion activa</span>
        </div>
        
        {/* Photo Grid within the banner */}
        {/* We use a grid layout that perfectly matches the reference design's tightly packed food photos */}
        <div className="flex-1 w-full px-4 pb-4 overflow-hidden relative">
           <img src="/food-collage.png" className="absolute inset-0 w-full h-full object-cover px-4 pb-4 rounded-b-lg" alt="Food Grid" />
           {/* Grid overlay lines to simulate multiple photos if the image is a single collage */}
           <div className="absolute inset-x-4 inset-y-0 pb-4 flex flex-col pointer-events-none">
             <div className="h-1/4 w-full border-b-[6px] border-[#111111]"></div>
             <div className="h-1/4 w-full border-b-[6px] border-[#111111]"></div>
             <div className="h-1/4 w-full border-b-[6px] border-[#111111]"></div>
           </div>
           <div className="absolute inset-y-0 inset-x-4 pb-4 flex pointer-events-none">
             <div className="w-1/2 h-full border-r-[6px] border-[#111111]"></div>
           </div>
        </div>
      </div>

      {/* Right Content - Login Card */}
      <div className="flex-1 flex items-center justify-center p-8 z-20">
        <div className="w-full max-w-[380px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-10">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold text-[#1f2937] mb-1.5">Iniciar sesión</h2>
            <p className="text-[#6b7280] text-[13px]">Accede a tu plataforma clínica</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[12px] font-medium text-[#4b5563] mb-1.5 ml-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] transition-all outline-none text-sm text-[#1f2937] bg-white placeholder-gray-400"
                placeholder="correo@dkfitt.com"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#4b5563] mb-1.5 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#eab308] focus:ring-1 focus:ring-[#eab308] transition-all outline-none text-sm text-[#1f2937] bg-white placeholder-gray-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-[12px] rounded-xl border border-red-100 text-center font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#eab308] hover:bg-[#d97706] text-[#1f2937] font-semibold text-sm py-3.5 rounded-xl transition-all active:scale-[0.98] mt-8 shadow-[0_8px_20px_-6px_rgba(234,179,8,0.5)]"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-[#1f2937]/30 border-t-[#1f2937] rounded-full animate-spin"></span>
              ) : (
                <>
                  <ArrowRight size={16} />
                  Iniciar sesión
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
