import React, { useState } from 'react';
import { Mail, Lock, User, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { UserProfile, restoreUserData } from '../utils/authUtils';

interface AuthPageProps {
  language: 'fa' | 'en' | 'de';
  onLoginSuccess: (userId: string) => void;
}

const AVATARS = ['🦁', '🦊', '🐯', '🐼', '🐨', '🦄', '🐰', '🐸', '🐨', '🦉'];

const TRANSLATIONS = {
  fa: {
    title: 'خوش آمدید',
    subtitle: 'سامانه یکپارچه پروداکتیویتی و سلامت',
    login: 'ورود به حساب',
    signup: 'ثبت‌نام جدید',
    fullName: 'نام و نام خانوادگی',
    username: 'نام کاربری',
    email: 'ایمیل',
    password: 'رمز عبور',
    rememberMe: 'مرا به خاطر بسپار',
    hasAccount: 'قبلاً ثبت‌نام کرده‌اید؟ وارد شوید',
    noAccount: 'حساب کاربری ندارید؟ ثبت‌نام کنید',
    avatarSelect: 'آواتار پروفایل',
    customUrl: 'یا لینک عکس سفارشی',
    errorInvalid: 'نام کاربری/ایمیل یا رمز عبور اشتباه است.',
    errorUserExists: 'این نام کاربری یا ایمیل قبلاً ثبت شده است.',
    errorFields: 'لطفاً تمامی فیلدهای الزامی را تکمیل کنید.',
    successSignup: 'ثبت‌نام با موفقیت انجام شد! در حال ورود...'
  },
  en: {
    title: 'Welcome Back',
    subtitle: 'Unified Productivity & Health Suite',
    login: 'Log In',
    signup: 'Sign Up',
    fullName: 'Full Name',
    username: 'Username',
    email: 'Email Address',
    password: 'Password',
    rememberMe: 'Remember me',
    hasAccount: 'Already have an account? Log In',
    noAccount: "Don't have an account? Sign Up",
    avatarSelect: 'Profile Avatar',
    customUrl: 'Or custom image URL',
    errorInvalid: 'Incorrect username/email or password.',
    errorUserExists: 'Username or email already exists.',
    errorFields: 'Please fill in all required fields.',
    successSignup: 'Account created successfully! Logging in...'
  },
  de: {
    title: 'Willkommen',
    subtitle: 'Integrierte Produktivitäts- & Gesundheitssuite',
    login: 'Einloggen',
    signup: 'Registrieren',
    fullName: 'Vollständiger Name',
    username: 'Benutzername',
    email: 'E-Mail-Adresse',
    password: 'Passwort',
    rememberMe: 'Angemeldet bleiben',
    hasAccount: 'Bereits ein Konto? Anmelden',
    noAccount: 'Noch kein Konto? Registrieren',
    avatarSelect: 'Profil-Avatar',
    customUrl: 'Oder eigene Bild-URL',
    errorInvalid: 'Benutzername/E-Mail oder Passwort falsch.',
    errorUserExists: 'Benutzername oder E-Mail existiert bereits.',
    errorFields: 'Bitte füllen Sie alle Pflichtfelder aus.',
    successSignup: 'Konto erfolgreich erstellt! Einloggen...'
  }
};

export default function AuthPage({ language, onLoginSuccess }: AuthPageProps) {
  const trans = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isRtl = language === 'fa';

  const [isLogin, setIsLogin] = useState(true);
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup specific states
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦁');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!emailOrUser || !password) {
      setError(trans.errorFields);
      return;
    }

    const usersStr = localStorage.getItem('users') || '{}';
    try {
      const users: Record<string, UserProfile> = JSON.parse(usersStr);
      
      // Find user by username or email
      const user = Object.values(users).find(
        u => (u.username.toLowerCase() === emailOrUser.toLowerCase() || u.email.toLowerCase() === emailOrUser.toLowerCase())
      );

      // Simple fake password validation (any user found in our localStorage is logged in if credentials match)
      // Since it's fake auth, we'll allow password check (usually we simulate saving hashed or raw passwords, we'll store raw passwords)
      const storedPassword = localStorage.getItem(`auth_pwd_${user?.id}`);
      if (user && storedPassword === password) {
        // Successful login
        localStorage.setItem('currentUserId', user.id);
        restoreUserData(user.id);
        onLoginSuccess(user.id);
      } else {
        setError(trans.errorInvalid);
      }
    } catch (e) {
      setError(trans.errorInvalid);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!signupUsername || !signupEmail || !signupPassword || !signupFullName) {
      setError(trans.errorFields);
      return;
    }

    const usersStr = localStorage.getItem('users') || '{}';
    try {
      const users: Record<string, UserProfile> = JSON.parse(usersStr);

      // Check if username or email exists
      const exists = Object.values(users).some(
        u => u.username.toLowerCase() === signupUsername.toLowerCase() || u.email.toLowerCase() === signupEmail.toLowerCase()
      );

      if (exists) {
        setError(trans.errorUserExists);
        return;
      }

      // Create new user profile
      const newUserId = `user-uuid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newUser: UserProfile = {
        id: newUserId,
        username: signupUsername.trim(),
        email: signupEmail.trim(),
        fullName: signupFullName.trim(),
        avatar: customAvatarUrl.trim() || selectedAvatar,
        createdAt: new Date().toISOString(),
        data: {} // empty isolated app data initially
      };

      // Save user
      users[newUserId] = newUser;
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem(`auth_pwd_${newUserId}`, signupPassword); // Store simulated password
      localStorage.setItem('currentUserId', newUserId);

      // Restore/initialize empty data
      restoreUserData(newUserId);

      setSuccess(trans.successSignup);
      setTimeout(() => {
        onLoginSuccess(newUserId);
      }, 1000);

    } catch (e) {
      setError(trans.errorUserExists);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#060410] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="w-full max-w-md bg-[#0c0821]/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 transition-all">
        
        {/* Brand logo header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 items-center justify-center text-white text-3xl select-none shadow-[0_0_20px_rgba(34,211,238,0.3)] mb-4 animate-bounce">
            🎯
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {trans.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            {trans.subtitle}
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex bg-white/5 border border-white/5 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${isLogin ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-400/20' : 'text-slate-400 hover:text-white'}`}
          >
            {trans.login}
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${!isLogin ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-400/20' : 'text-slate-400 hover:text-white'}`}
          >
            {trans.signup}
          </button>
        </div>

        {/* Error / Success states */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 flex items-start gap-2 text-red-400 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-4 flex items-start gap-2 text-emerald-400 text-xs">
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {isLogin ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block">{trans.username} / {trans.email}</label>
              <div className="relative">
                <User className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400`} />
                <input
                  type="text"
                  required
                  placeholder="ali @ example.com"
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-2.5 ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} text-xs text-white focus:border-cyan-400 focus:outline-none transition-all`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block">{trans.password}</label>
              <div className="relative">
                <Lock className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400`} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-2.5 ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} text-xs text-white focus:border-cyan-400 focus:outline-none transition-all font-mono`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-4 h-4 accent-cyan-400 cursor-pointer"
                />
                <span className="text-[11px] text-slate-400 font-bold">{trans.rememberMe}</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black text-xs rounded-xl transition-all shadow-[0_4px_15px_rgba(34,211,238,0.2)] active:scale-[0.98] cursor-pointer flex items-center justify-center"
            >
              {trans.login}
            </button>

            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className="w-full text-center text-[10px] text-slate-400 hover:text-cyan-400 transition-all pt-2 block"
            >
              {trans.noAccount}
            </button>
          </form>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSignupSubmit} className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block">{trans.fullName}</label>
              <div className="relative">
                <User className={`absolute top-2.5 ${isRtl ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400`} />
                <input
                  type="text"
                  required
                  placeholder="Ali Rezaei"
                  value={signupFullName}
                  onChange={(e) => setSignupFullName(e.target.value)}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-2 ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} text-xs text-white focus:border-cyan-400 focus:outline-none transition-all`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block">{trans.username}</label>
              <div className="relative">
                <User className={`absolute top-2.5 ${isRtl ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400`} />
                <input
                  type="text"
                  required
                  placeholder="ali"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-2 ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} text-xs text-white focus:border-cyan-400 focus:outline-none transition-all`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block">{trans.email}</label>
              <div className="relative">
                <Mail className={`absolute top-2.5 ${isRtl ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400`} />
                <input
                  type="email"
                  required
                  placeholder="ali@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-2 ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} text-xs text-white focus:border-cyan-400 focus:outline-none transition-all`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block">{trans.password}</label>
              <div className="relative">
                <Lock className={`absolute top-2.5 ${isRtl ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400`} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-2 ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} text-xs text-white focus:border-cyan-400 focus:outline-none transition-all font-mono`}
                />
              </div>
            </div>

            {/* Avatar Selectors */}
            <div className="space-y-1.5 border-t border-white/5 pt-2">
              <label className="text-[10px] text-slate-400 font-bold block">{trans.avatarSelect}</label>
              <div className="flex flex-wrap gap-2 justify-center py-1 bg-white/[0.02] border border-white/5 rounded-xl">
                {AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => { setSelectedAvatar(emoji); setCustomAvatarUrl(''); }}
                    className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all ${selectedAvatar === emoji && !customAvatarUrl ? 'bg-cyan-500/20 scale-110 border border-cyan-400/30' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              
              <div className="relative mt-1">
                <ImageIcon className={`absolute top-2.5 ${isRtl ? 'right-3' : 'left-3'} w-4 h-4 text-slate-400`} />
                <input
                  type="text"
                  placeholder={trans.customUrl}
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-2 ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} text-[11px] text-white focus:border-cyan-400 focus:outline-none transition-all`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black text-xs rounded-xl transition-all shadow-[0_4px_15px_rgba(34,211,238,0.2)] active:scale-[0.98] cursor-pointer mt-2"
            >
              {trans.signup}
            </button>

            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className="w-full text-center text-[10px] text-slate-400 hover:text-cyan-400 transition-all pt-1 block"
            >
              {trans.hasAccount}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
