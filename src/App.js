import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import FeedbackForm from './components/Feedback/FeedbackForm';
import Admin from './components/Admin/Admin';
import FeedbackSubmitted from './components/FeedbackSubmitted/FeedbackSubmitted';
import AddStudentData from './components/Admin/AddStudentData'; 
import AddCourseData from './components/Admin/AddCourseData';
import Footer from './components/Footer/Footer';
const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/feedback" element={<FeedbackForm />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/feedback-submitted" element={<FeedbackSubmitted />} /> 
                <Route path="/add-student" element={<AddStudentData />} />
                <Route path='/add-course' element={<AddCourseData />} />
            </Routes>
            <Footer />
        </Router>
       
    );
};

export default App;