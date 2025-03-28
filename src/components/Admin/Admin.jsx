import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import './Admin.css'; // Import the CSS file
import FeedbackViewer from './FeedbackViewer';
import Alogo from '../Alogo/Alogo';

const Admin = () => {
  const [feedbacks, setFeedbacks] = useState([]); // Keep only feedbacks state
  const [feedbackTypeStatuses, setFeedbackTypeStatuses] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Fetch all feedbacks
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/feedback/getFeedbacks'); // Corrected URL
        setFeedbacks(response.data || []);
      } catch (error) {
        console.error('Error fetching feedbacks:', error.message);
      }
    };

    fetchFeedbacks();
  }, []); // Remove dependencies

  useEffect(() => {
    const fetchFeedbackTypeStatuses = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/feedback-type-status');
        setFeedbackTypeStatuses(response.data || []);
      } catch (error) {
        console.error('Error fetching feedback type statuses:', error.message);
      }
    };

    fetchFeedbackTypeStatuses();
  }, []);

  const toggleFeedbackTypeStatus = async (type, enabled) => {
    try {
      const response = await axios.post('http://localhost:5000/api/admin/feedback-type-status', {
        type,
        enabled,
      });
      setFeedbackTypeStatuses((prev) =>
        prev.map((status) =>
          status.type === type ? { ...status, enabled: response.data.feedbackType.enabled } : status
        )
      );
    } catch (error) {
      console.error('Error updating feedback type status:', error.message);
    }
  };

  const handleAddStudent = () => {
    navigate('/add-student'); // Navigate to AddStudentData component
  };

  const handleAddCourse = () => {
    // Redirect to add course page or open a modal
    navigate('/add-course'); 
  };
  return (
    <div className="admin-panel">
      <Alogo/>
      <h1 className="admin-title">Admin Panel</h1>
      <div className="button-section">
        <button className="action-button" onClick={handleAddStudent}>
          Add Student Data
        </button>
        <button className="action-button" onClick={handleAddCourse}>
          Add Course Data
        </button>
      </div>
      <FeedbackViewer />
      <div className="feedback-type-section">
        <h3>Manage Feedback Types</h3>
        {feedbackTypeStatuses.map((status) => (
          <div key={status.type} className="feedback-type">
            <span>{status.type}</span>

            <button
              className={`toggle-button ${status.enabled ? 'enabled' : 'disabled'}`}
              onClick={() => toggleFeedbackTypeStatus(status.type, !status.enabled)}
            >
              {status.enabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        ))}
      </div>
      <h2>All Students Feedback</h2>
      <table className="feedback-table">
      
        <thead>
          <tr>
            <th>SLNO</th>
            <th>Student Name</th>
            <th>USN</th>
            <th>Course</th>
            <th>Academic Year</th>
            <th>Semester</th>
            <th>Feedback Type</th>
            <th>Comments</th>
            <th>Subjects & Ratings</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map((feedback, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{feedback.student?.name || 'N/A'}</td>
              <td>{feedback.student?.usn || 'N/A'}</td>
              <td>{feedback.student?.course || 'N/A'}</td>
              <td>{feedback.academicYear}</td>
              <td>{feedback.semester}</td>
              <td>{feedback.feedbackType}</td>
              <td>{feedback.comments}</td>
              <td>
                {feedback.feedback.map((item, i) => (
                  <span key={i}>
                    {item.subject}: {item.ratings.join(', ')}
                    {i < feedback.feedback.length - 1 && <br />}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
