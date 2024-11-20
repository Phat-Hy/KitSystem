import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import './App.css';
import StemsPage from './StemsPage';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import ManagerPage from './ManagerPage';
import AddKit from './AddKit';
import UpdateKit from './UpdateKit';
import { CartProvider } from './CartContext';
import Login from './Login';
import Register from './Register';
import GLogin from './GLogin';
import { AuthProvider, useAuth } from './AuthContext';
import LabPage from './LabPage';
import Profile from './Profile';
import ReactDOM from "react-dom";
import Zendesk, { ZendeskAPI } from "./ZendeskConfig";

function App() {
    return (
        <CartProvider>
            <AuthProvider>
                <Router>
                    <Main />
                </Router>
            </AuthProvider>
        </CartProvider>
    );
}

function Main() {
    const { user, setUser } = useAuth(); 
    const isMember = () => user && user.roleId === 2;
    const ZENDESK_KEY = "6ac66eb7-7c95-47dd-b317-7b60d5744a6c";

    const handleLoaded = () => {
        ZendeskAPI("messenger", "open");
    };

    return (
        <div>
            <div className="home-container">
                {user ? (
                    <h2>
                        Welcome to the Kit Kits App, {user.firstName} {user.lastName}!
                    </h2>
                ) : (
                    <h2>Welcome to the Kit Kits App!</h2>
                )}
            </div>
            <nav>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    {!user ? (
                        <>
                            <li>
                                <Link to="/google-login">Login Using Google Account</Link>
                            </li>
                            <li>
                                <Link to="/login">Login</Link>
                            </li>
                            <li>
                                <Link to="/register">Register</Link>
                            </li>
                        </>
                    ) : (
                        <></>
                    )}
                    <li>
                        <Link to="/stems">Stems Page</Link>
                    </li>
                    {user && (
                        <>
                            <li>
                                <Link to="/cart">Cart</Link>
                            </li>
                            {isMember() && (
                                <li>
                                    <Link to="/manager">Manager Page</Link>
                                </li>
                            )}
                            <li>
                                <Link to="/lab">Lab PDF Files</Link>
                            </li>
                            <li>
                                <Link to="/profile">Account Page</Link>
                            </li>
                            <div>
                                <Zendesk defer zendeskKey={ZENDESK_KEY} onLoaded={handleLoaded} />
                            </div>
                        </>
                    )}
                </ul>
            </nav>
            <Routes>
                <Route path="/" element={<div></div>} />
                <Route path="/google-login" element={<GLogin />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/stems" element={<StemsPage user={user} isMember={isMember()} />} />
                <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />} />
                <Route path="/cart" element={user ? <CartPage /> : <Navigate to="/login" />} />
                <Route path="/checkout" element={user ? <CheckoutPage /> : <Navigate to="/login" />} />
                <Route path="/manager" element={isMember() ? <ManagerPage /> : <Navigate to="/login" />} />
                <Route path="/add-kit" element={isMember() ? <AddKit /> : <Navigate to="/login" />} />
                <Route path="/update-kit" element={isMember() ? <UpdateKit /> : <Navigate to="/login" />} />
                <Route path="/lab" element={user ? <LabPage /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </div>
    );
}

export default App;
