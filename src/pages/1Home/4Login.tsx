import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    TextField,
    IconButton,
    InputAdornment,
    Button,
    CircularProgress
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import nishaLogo from '../../assets/Logos/NISHA LOGO .jpg';
import nishaHero from '../../assets/Images/NISHA LOGO -WHITE BAG.jpeg';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

interface User {
    id: string | number;
    first_name: string;
    last_name: string;
    email?: string;
}

interface LoginResponse {
    token: string;
    role: 'admin' | 'staff';
    user: User;
}

const LoginPage: React.FC = () => {

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

            const response = await axios.post<LoginResponse>(
                `${API}/api/auth/login`,
                { username, password }
            );

            const { role, user, token } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('loginTime', String(Date.now()));

            localStorage.setItem(
                'user',
                JSON.stringify({
                    id: user.id,
                    role,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email || ''
                })
            );

            if (role === 'admin') navigate('/admin/dashboard');
            else navigate('/staff/dashboard');

        } catch (err: any) {

            setError(err.response?.data?.message || 'Invalid username or password');

        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="flex h-screen w-full bg-slate-100 font-['Outfit']">

            {/* LEFT PANEL */}

            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 items-center justify-center px-12">

                <div className="max-w-lg text-center flex flex-col items-center space-y-8">

                    <img
                        src={nishaHero}
                        alt="Nisha Oil Mill"
                        className="w-full max-w-md object-contain rounded-3xl shadow-2xl bg-white p-6"
                    />

                    <div className="space-y-4">

                        <h1 className="text-4xl font-extrabold text-white leading-tight">
                            Nisha Oil Mill <br /> Management System
                        </h1>

                        <p className="text-slate-300 text-lg">
                            Manage oil production, staff operations, product orders
                            and billing efficiently.
                        </p>

                        <div className="text-slate-400 text-sm space-y-1">
                            <p>Products: Groundnut Oil • Coconut Oil • Sesame Oil • Castor Oil</p>
                            <p>Also Available: Neem Oil • Palm Oil • Lamp Oil • Mahua Oil</p>
                        </div>

                    </div>

                </div>

            </div>

            {/* RIGHT PANEL */}

            <div className="w-full lg:w-1/2 flex items-center justify-center px-10 md:px-24 bg-slate-100">

                <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl">

                    {/* LOGO */}

                    <div className="text-center mb-10">

                        <img
                            src={nishaLogo}
                            className="w- h-16 mx-auto mb-4 rounded-xl shadow"
                            alt="Logo"
                        />

                        <h2 className="text-3xl font-bold text-slate-800">
                            Sign In
                        </h2>

                        <p className="text-slate-500 text-sm mt-1">
                            Login to access the Nisha Oil Mill dashboard
                        </p>

                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* USERNAME */}

                        <div className="space-y-1">

                            <label className="text-sm font-semibold text-slate-700 ml-2">
                                Username
                            </label>

                            <TextField
                                fullWidth
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                variant="outlined"
                                sx={PillInputStyles}
                            />

                        </div>

                        {/* PASSWORD */}

                        <div className="space-y-1">

                            <label className="text-sm font-semibold text-slate-700 ml-2">
                                Password
                            </label>

                            <TextField
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                variant="outlined"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword
                                                    ? <Visibility className="text-slate-400" />
                                                    : <VisibilityOff className="text-slate-400" />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                sx={PillInputStyles}
                            />

                        </div>



                        {error && (
                            <div className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            fullWidth
                            sx={GradientButtonStyles}
                        >

                            {loading
                                ? <CircularProgress size={24} color="inherit" />
                                : 'Sign In'}

                        </Button>

                    </form>

                </div>

            </div>

        </div>

    );
};

const PillInputStyles = {
    '& .MuiOutlinedInput-root': {
        backgroundColor: '#f1f5f9',
        borderRadius: '50px',
        fontFamily: "'Outfit', sans-serif",
        '& fieldset': { border: 'none' },
        '&:hover fieldset': { border: 'none' },
        '&.Mui-focused fieldset': { border: '1px solid #cbd5f5' },
        '& input': { px: 3, py: 2 }
    }
};

const GradientButtonStyles = {
    py: 1.8,
    borderRadius: '50px',
    background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 'bold',
    textTransform: 'none',
    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
    '&:hover': {
        background: 'linear-gradient(to right, #1d4ed8, #1e40af)'
    }
};

export default LoginPage;