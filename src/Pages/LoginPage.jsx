import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../UserContext/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import '../Styles/style.css';
import 'react-toastify/dist/ReactToastify.css';

const illustration = "images/image2.png";
const API_BASE = "http://localhost:5000/api/auth";

function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const { register, handleSubmit, formState: { errors }, } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        try {
            if (isLogin) {
                const res = await axios.post(`${API_BASE}/login`, data);
                login(res.data.token, res.data.user);
                toast.success('Login successful!', {
                    position: 'bottom-center',
                    autoClose: 2000,
                    onClose: () => navigate('/tasks'),
                });
            } else {
                await axios.post(`${API_BASE}/signup`, data);
                toast.success('Signup successful!', {
                    position: 'bottom-center',
                    autoClose: 2000,
                    onClose: () => setIsLogin(true),
                });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong.', {
                position: 'bottom-center',
            });
        }
    };

    return (
        <div className="login-container">

            <div className="login-form-section">
                <div className="logo-section">
                    <img src="/images/logo.png" alt="Logo" />
                </div>
                <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
                <p>{isLogin ? "Log in to manage your tasks efficiently" : "Sign up to start managing tasks"}</p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {!isLogin && (
                        <>
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                {...register('name', {
                                    required: 'Name is required'
                                })}
                                placeholder="Enter your name"
                            />
                            {errors.name && <p className="error-msg">{errors.name.message}</p>}
                        </>
                    )}
                    <label htmlFor="useremail">Email address</label>
                    <input
                        type="text"
                        {...register('useremail', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: 'Please enter a valid email address'
                            }
                        })}
                        placeholder="Enter your email"
                    />
                    {errors.useremail && <p className="error-msg">{errors.useremail.message}</p>}

                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        {...register('password', {
                            required: 'Password is required',
                            minLength: { value: 8, message: 'Password must be at least 8 characters' },
                            pattern: {
                                value: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message: 'Password must include uppercase, number, and special character'
                            }
                        })}
                        placeholder="Enter your password"
                    />
                    {errors.password && <p className="error-msg">{errors.password.message}</p>}



                    <button type="submit">{isLogin ? "Sign in" : "Sign up"}</button>
                </form>

                <p style={{ marginTop: '10px', textAlign: 'center' }}>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <span
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ color: '#732a6f', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                        {isLogin ? "Sign up" : "Login"}
                    </span>
                </p>
            </div>

            <div className="login-image-section">
                <img src={illustration} alt="Task management" />
            </div>

            <ToastContainer />
        </div>
    );
}

export default LoginPage;
