import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';

const GLogin = ({ setUser }) => {
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await fetch('http://localhost:5138/api/GoogleLogin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tokenId: credentialResponse.credential }),
            });

            const data = await res.json();
            if (res.ok) {
                setUser(data); // Save the user data in the state
                navigate('/'); // Redirect to the homepage
            } else {
                console.error('Login failed: ', data.message);
            }
        } catch (error) {
            console.error('Google login error: ', error);
        }
    };

    const handleGoogleFailure = () => {
        console.error('Google login failed');
    };

    return (
        <GoogleOAuthProvider clientId="753203194812-mtb1prj2holbag7kqpn0d0j9rave9stf.apps.googleusercontent.com">
            <div className="login-container">
                <h2>Login</h2>
                {/* Google Login Button */}
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleFailure}
                />
            </div>
        </GoogleOAuthProvider>
    );
};

export default GLogin;
