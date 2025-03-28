import React, { useState } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for default props validation
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Login.css'; // Import the CSS file
import img from './Amity_University_logo.png'; // Import the logo image
const Login = ({ onLogin }) => {
    const [usn, setUsn] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userInfo, setUserInfo] = useState(null); // State to store user information
    const [successMessage, setSuccessMessage] = useState(''); // State for success message
    const [isSubmitted, setIsSubmitted] = useState(false); // State to prevent multiple submissions
    const navigate = useNavigate(); // Initialize useNavigate
    
    if (!navigate) {
        throw new Error('useNavigate must be used within a Router component');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            if (usn === 'Admin' && password === 'Amity@6min') {
                navigate('/admin');
                return;
            }

            const response = await axios.post('http://localhost:5000/api/students/login', { usn, password });
            const user = response.data;

            if (user.role === 'student') {
                // Handle student login
                localStorage.setItem('usn', user.usn);
                localStorage.setItem('studentCourse', user.course);
                localStorage.setItem('role', 'student');
                localStorage.setItem('name', user.name);

                // Check feedback submission status for the logged-in student
                const feedbackSubmitted = localStorage.getItem(`feedbackSubmitted_${user.usn}`);
                if (feedbackSubmitted === 'true') {
                    navigate('/feedback-submitted');
                    return;
                }

                setUserInfo(user);
                setSuccessMessage('Login submitted successfully!');
                setIsSubmitted(true);
                navigate('/feedback');
            } else {
                setError('Unexpected role received. Please contact support.');
            }

            if (typeof onLogin === 'function') {
                onLogin(user);
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message); // Display backend error message
            } else if (err.message) {
                setError(`Error: ${err.message}`); // Display network or unexpected error
            } else {
                setError('An error occurred. Please try again later.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
    <>
        
        <div className="login-container">  
        <h1 style={{color:"#010f7a"}}>Faculty Feedback System AUB</h1>  
        <form onSubmit={handleSubmit} className="login-form">
                <div className="logo-container">
                    <img src={img} alt="Logo" />
                </div>
                <h2 className="login-title">Login</h2>
                {error && <p className="error-message">{error}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
                <input
                    type="text"
                    placeholder="USN"
                    value={usn}
                    onChange={(e) => setUsn(e.target.value)}
                    className="login-input"
                    disabled={loading || isSubmitted}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                    disabled={loading || isSubmitted}
                />
                <button type="submit" className="login-button" disabled={loading || isSubmitted}>
                    {loading ? 'Logging in...' : isSubmitted ? 'Submitted' : 'Login'}
                </button>
            </form>
        </div>
        </>
    );
};

Login.propTypes = {
    onLogin: PropTypes.func, // Validate that onLogin is a function
};

Login.defaultProps = {
    onLogin: () => {}, // Provide a default no-op function for onLogin
};

export default Login;