import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, IconButton, InputAdornment, Button, CircularProgress } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import nishaLogo from '../../assets/Logos/NISHA LOGO .jpg';
import nishaHero from '../../assets/Images/NISHA LOGO -WHITE BAG.jpeg';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await axios.post(`${API}/api/auth/login`, { username, password });
            const { role, user, token } = response.data;
            // Store auth artifacts for ProtectedRoute checks
            localStorage.setItem('token', token);
            localStorage.setItem('loginTime', String(Date.now()));
            localStorage.setItem('user', JSON.stringify({
                id: user.id,
                role,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email || ''
            }));
            if (role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/staff/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden font-['Outfit']">

            {/* ── LEFT PANEL — Illustration ── */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 flex-col items-center overflow-hidden">
                {/* Gradient blobs */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-950 via-blue-950/60 to-indigo-950/80" />
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />

                {/* Scrollable content */}
                <div className="relative z-10 flex flex-col items-center px-12 text-center py-10 overflow-y-auto flex-grow w-full hide-scrollbar">
                    {/* Hero Image */}
                    <img
                        src={nishaHero}
                        alt="Company Management System"
                        className="w-full max-w-sm rounded-[32px] shadow-2xl shadow-blue-900/40 object-cover mb-8 border border-white/5 flex-shrink-0"
                    />

                    {/* Tagline */}
                    <h2 className="text-3xl font-black italic tracking-tighter text-white leading-tight">
                        Manage Your Team.<br />
                        <span className="text-blue-400">Seamlessly.</span>
                    </h2>
                    <p className="text-slate-400 mt-3 text-base font-medium max-w-sm">
                        A unified platform for admin control and staff collaboration.
                    </p>

                    {/* Owner Info */}
                    <div className="mt-6 flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm w-full max-w-sm">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/30 flex-shrink-0">
                            P
                        </div>
                        <div className="text-left">
                            <p className="text-white font-black text-sm tracking-tight leading-none">Prathap</p>
                            <p className="text-blue-400 text-xs font-bold tracking-wide flex items-center gap-1.5 mt-1">
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                9965174472
                            </p>
                        </div>
                        <span className="ml-auto px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/30 flex-shrink-0">Owner</span>
                    </div>

                    {/* Feature badges */}
                    <div className="flex flex-wrap justify-center gap-3 mt-6">
                        {['👥 Team Control', '📋 Order Lines', '🔔 Requests', '⚙️ Settings'].map((badge) => (
                            <span
                                key={badge}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-slate-300 backdrop-blur-sm"
                            >
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Bottom brand strip */}
                <div className="relative z-10 py-4 flex justify-center flex-shrink-0">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        © 2026 Nisha Company Management
                    </p>
                </div>
            </div>

            {/* ── RIGHT PANEL — Login Form ── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-900 overflow-y-auto hide-scrollbar">
                <div className="w-full max-w-md px-8 py-12">

                    {/* Logo */}
                    <div className="flex items-center space-x-4 mb-10">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/40 flex-shrink-0 overflow-hidden">
                            <img src={nishaLogo} alt="Nisha Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Nisha Systems</h1>
                            <p className="text-blue-400 text-[11px] font-bold uppercase tracking-widest mt-0.5">Management Portal</p>
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="mb-10">
                        <h2 className="text-4xl font-black italic tracking-tighter text-white">Welcome back.</h2>
                        <p className="text-slate-400 mt-2 font-medium">Sign in to access your dashboard</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-2">
                                Username
                            </label>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                autoComplete="username"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        color: 'white',
                                        borderRadius: '16px',
                                        fontFamily: "'Outfit', sans-serif",
                                        fontWeight: 500,
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                            borderWidth: '1px'
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'rgba(59, 130, 246, 0.5)',
                                            borderWidth: '2px'
                                        }
                                    },
                                    '& .MuiInputBase-input::placeholder': {
                                        color: '#475569',
                                        opacity: 1
                                    }
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-2">
                                Password
                            </label>
                            <TextField
                                fullWidth
                                variant="outlined"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{ color: '#64748b', '&:hover': { color: '#60a5fa' } }}
                                            >
                                                {showPassword ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        color: 'white',
                                        borderRadius: '16px',
                                        fontFamily: "'Outfit', sans-serif",
                                        fontWeight: 500,
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                            borderWidth: '1px'
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'rgba(59, 130, 246, 0.5)',
                                            borderWidth: '2px'
                                        }
                                    },
                                    '& .MuiInputBase-input::placeholder': {
                                        color: '#475569',
                                        opacity: 1
                                    }
                                }}
                            />
                        </div>


                        {error && (
                            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-5 py-4 rounded-2xl">
                                <span className="text-lg">⚠️</span>
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            variant="contained"
                            fullWidth
                            startIcon={
                                loading ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : undefined
                            }
                            endIcon={
                                !loading ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                ) : undefined
                            }
                            sx={{
                                py: 2,
                                mt: 2,
                                borderRadius: '16px',
                                backgroundColor: '#2563eb', // blue-600
                                color: 'white',
                                fontFamily: "'Outfit', sans-serif",
                                fontWeight: 900,
                                fontSize: '0.875rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.3), 0 8px 10px -6px rgba(37, 99, 235, 0.3)',
                                '&:hover': {
                                    backgroundColor: '#3b82f6', // blue-500
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 25px 30px -5px rgba(37, 99, 235, 0.4)'
                                },
                                transition: 'all 0.2s'
                            }}
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </Button>
                    </form>

                    {/* Role hint cards */}
                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Admin Access</p>
                            <p className="text-xs text-slate-300 font-medium">Full team & system control</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Staff Access</p>
                            <p className="text-xs text-slate-300 font-medium">Directory & order lines</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-slate-600 text-xs mt-10">
                        Forgot your password?{' '}
                        <span className="text-blue-400 cursor-pointer hover:text-blue-300 transition-colors font-bold">
                            Contact IT Support
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
