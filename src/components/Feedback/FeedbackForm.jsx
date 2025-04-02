import React, { useState, useEffect } from 'react';
import './FeedbackForm.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Alogo from '../Alogo/Alogo';
const FeedbackForm = () => {
    const [academicYear, setAcademicYear] = useState('');
    const [semester, setSemester] = useState('');
    const [feedbackType, setFeedbackType] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [questions, setQuestions] = useState([]); // State to store questions
    const [comments, setComments] = useState({});
    const [courseName, setCourseName] = useState(localStorage.getItem('studentCourse') || '');
    const [use, setUse] = useState(localStorage.getItem('usn') || '');
    const [academicYears, setAcademicYears] = useState([]); // Fetch academic years from backend
    const [semesters, setSemesters] = useState([]); // Fetch semesters dynamically
    const [feedbackTypeStatuses, setFeedbackTypeStatuses] = useState([]);
    const [fieldWarnings, setFieldWarnings] = useState({}); // State to track warnings for fields

    const navigate = useNavigate(); // Initialize useNavigate

    console.log(feedbackTypeStatuses)
    useEffect(() => {
        const usn = localStorage.getItem('usn');
        const password = localStorage.getItem('usn');
        if (!usn || !password) {
            alert('USN or password is missing. Please log in again.');
            navigate('/login'); // Redirect to login page
        }
    }, []);

    useEffect(() => {
        const fetchAcademicYears = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/courses/academic-years', {
                    params: { course: courseName }, // Pass course name as a query parameter
                });
                if (response.status === 200 && response.data.academicYears) {
                    setAcademicYears(response.data.academicYears);
                } else {
                    console.error('Failed to fetch academic years:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching academic years:', error.message);
            }
        };

        fetchAcademicYears(); // Fetch academic years first
    }, [courseName]); // Add courseName as a dependency

    useEffect(() => {
        if (!academicYear) return; // Ensure academic year is selected before fetching semesters

        const fetchSemesters = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/courses/semesters/${academicYear}`, {
                    params: { course: courseName }, // Pass course name as a query parameter
                });
                if (response.status === 200 && response.data.semesters) {
                    const normalizedSemesters = response.data.semesters.map((sem) =>
                        sem.trim().toLowerCase()
                    );
                    const uniqueSemesters = [...new Set(normalizedSemesters)]; // Remove duplicates
                    setSemesters(uniqueSemesters);
                } else {
                    console.error('Failed to fetch semesters:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching semesters:', error.message);
            }
        };

        fetchSemesters();
    }, [academicYear, courseName]); // Add courseName as a dependency

    useEffect(() => {
        if (!semester || !feedbackType) return; // Ensure semester and feedbackType are selected before fetching subjects and questions

        const fetchSubjectsAndQuestions = async () => {
            try {
                // Fetch subjects
                const encodedSemester = encodeURIComponent(semester);
                const subjectsResponse = await axios.get(`http://localhost:5000/api/courses/subjects/${encodedSemester}`, {
                    params: { course: courseName }, // Pass course name as a query parameter
                });
                const { subjects } = subjectsResponse.data;

                // Fetch questions
                const questionsResponse = await axios.get(`http://localhost:5000/api/questions/${feedbackType}`);
                const { questions } = questionsResponse.data;

                // Update state
                setSubjects(
                    subjects.map((subject) => ({
                        name: subject.name,
                        subjectCode: subject.subjectCode,
                        professorName: subject.professorName,
                        ratings: questions.map((question) => ({ question, rating: 0 })),
                    }))
                );
                setQuestions(questions || []);
            } catch (error) {
                console.error('Error fetching subjects or questions:', error.response?.data || error.message); // Debug log
                alert('Failed to fetch subjects or questions. Please try again.');
            }
        };

        fetchSubjectsAndQuestions();
    }, [semester, courseName, feedbackType]); // Fetch subjects and questions when semester, courseName, or feedbackType changes

    useEffect(() => {
        const fetchFeedbackTypeStatuses = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/admin/feedback-type-status');
                const statuses = response.data || [];
                setFeedbackTypeStatuses(statuses);

                // Automatically set the feedback type to the first enabled type
                const enabledType = statuses.find((status) => status.enabled);
                if (enabledType) {
                    setFeedbackType(enabledType.type);
                }
            } catch (error) {
                console.error('Error fetching feedback type statuses:', error.message);
            }
        };

        fetchFeedbackTypeStatuses();
    }, []);

    const handleFeedbackTypeClick = async (type) => {
        setFeedbackType(type);

        if (type === 'Pre-Feedback' || type === 'Post-Feedback') {
            try {
                const response = await axios.post('http://localhost:5000/api/login', {
                    usn: localStorage.getItem('usn'),
                    password: localStorage.getItem('password'), // Use actual password from localStorage
                });
                const { subjects } = response.data;
                const filteredSubjects = subjects.filter((subject) => subject.semester === semester);
                setSubjects(
                    filteredSubjects.map((subject) => ({
                        name: subject.name,
                        ratings: questions.map((question) => ({ question, rating: 0 })),
                    }))
                );
            } catch (error) {
                console.error('Error fetching subjects:', error);
                alert('Failed to fetch subjects. Please try again.');
            }
        }
    };

    const handleSemesterChange = (sem) => {
        setSemester(sem);
        setFeedbackType(''); // Reset feedback type when semester changes
        setSubjects([]); // Clear subjects when semester changes
        setQuestions([]); // Clear questions when semester changes
    };

    const handleRatingChange = (subjectIndex, questionIndex, value) => {
        const rating = parseInt(value, 10);
        if (rating < 0 || rating > 5) {
            alert('Rating must be between 1 and 5.');
            return;
        }
        const updatedSubjects = [...subjects];
        updatedSubjects[subjectIndex].ratings[questionIndex].rating = rating;
        setSubjects(updatedSubjects);
    };

    const handleCommentChange = (subjectName, value) => {
        setComments({ ...comments, [subjectName]: value });
    };

    const handleKeyDown = (e, nextFieldId) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
            const nextField = document.getElementById(nextFieldId);
            if (nextField) {
                nextField.focus();
            }
        }
    };

    const validateFields = () => {
        const warnings = {};

        if (!academicYear) warnings.academicYear = 'Please select an academic year.';
        if (!semester) warnings.semester = 'Please select a semester.';
        if (!feedbackType) warnings.feedbackType = 'Please select a feedback type.';
        if (subjects.some((subject) => subject.ratings.some((rating) => rating.rating === 0))) {
            warnings.ratings = 'Please provide ratings for all questions.';
        }

        setFieldWarnings(warnings);
        return Object.keys(warnings).length === 0; // Return true if no warnings
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateFields()) {
            alert('Please fill in all required fields.');
            return;
        }

        const feedbackData = {
            student: {
                _id: localStorage.getItem('usn'), // Assuming USN is unique and used as ID
                name: localStorage.getItem('name'), // Replace with actual student name if available
                usn: localStorage.getItem('usn'),
                course: localStorage.getItem('studentCourse'), // Replace with actual course name if available
            },
            academicYear,
            semester,
            feedbackType,
            feedback: subjects.map((subject) => ({
                subject: subject.name,
                professorName: subject.professorName, // Include professor name in feedback
                ratings: subject.ratings.map((rating) => rating.rating), // Ensure ratings are properly formatted
            })),
            comments: comments.general || 'No comments', // Default to 'No comments' if empty
        };

        console.log('Submitting feedback data:', feedbackData); // Debug log

        try {
            await axios.post('http://localhost:5000/api/feedback/submit-feedback', feedbackData); // Correct endpoint
            localStorage.setItem(`feedbackSubmitted_${localStorage.getItem('usn')}`, 'true'); // Store feedback status for the specific student
            navigate('/feedback-submitted'); // Use navigate instead of window.location.href
        } catch (error) {
            console.error('Error submitting feedback:', error.response?.data || error.message);
            alert('Error submitting feedback. Please try again.');
        }
    };

    return (<>
        <div className="feedback-form-container">
            <form onSubmit={handleSubmit} className="feedback-form">
            <Alogo/>
                <h3 className="form-title">Feedback Form</h3>
                {courseName && <h4 className="course-info">Course: {courseName}</h4>}
                {use && <h4 className="course-info">USN: {use}</h4>}
                <div className="form-group">
                    <label>Select Academic Year:</label>
                    <select
                        className={`dropdown ${fieldWarnings.academicYear ? 'warning' : ''}`} // Add warning class if needed
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                    >
                        <option value="">-Academic Year-</option>
                        {academicYears.map((year, index) => (
                            <option key={index} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                    {fieldWarnings.academicYear && <span className="warning-text">{fieldWarnings.academicYear}</span>}
                    <label>Select Semester:</label>
                    <select
                        className={`dropdown ${fieldWarnings.semester ? 'warning' : ''}`} // Add warning class if needed
                        value={semester}
                        onChange={(e) => handleSemesterChange(e.target.value)}
                        disabled={!academicYear} // Disable if no academic year is selected
                    >
                        <option value="">-Semesters-</option>
                        {semesters.map((sem, index) => (
                            <option key={index} value={sem}>
                                {sem}
                            </option>
                        ))}
                    </select>
                    {fieldWarnings.semester && <span className="warning-text">{fieldWarnings.semester}</span>}
                </div>
                {semester && (
                    <div className="form-group1">
                        <div className="feedback-type-buttons">
                            {['Pre-Feedback', 'Post-Feedback'].map((type, index) => {
                                const status = feedbackTypeStatuses.find((status) => status.type === type);
                                const isDisabled = status ? !status.enabled : true;

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`feedback-type-button ${feedbackType === type ? 'active' : ''}`}
                                        onClick={() => setFeedbackType(type)}
                                        disabled={isDisabled}
                                    >
                                        {type}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="feedback-instructions">
                        <p> <span style={{color:"red",fontSize:"19px"}}>*</span> Please rate each question on a scale of 1-5:</p>
                        <table className="feedback-instructions-table" style={{ marginBottom: '10px', width: '200px' }}>
                        <tr id='table-row'>
                            <td>Poor</td> 
                            <td>Fair</td>
                            <td>Average</td>
                            <td>Good</td>
                            <td>Excellent</td>
                       </tr>
                       <tr id='table-row'>
                        <td>1</td>
                        <td>2</td>
                        <td>3</td>
                        <td>4</td>
                        <td>5</td>
                       </tr>
                     </table>
                     </div>
                    </div>
                )}
              
                {feedbackType && questions.length > 0 && (
                    <div>
                        <h4>Questions for {feedbackType}</h4>
                        <div className="table-container">
                            <table style={{ marginBottom: '10px', width: '100%' }}>
                                <thead>
                                    <tr>
                                        
                                        <th id="q-no">Q No</th>
                                        <th id="questions">Question</th>
                                        {subjects.map((subject, subjectIndex) => (
                                            <th key={subjectIndex}>
                                                {subject.name}
                                                <br />
                                                <small>{subject.subjectCode}</small>
                                                <br />
                                                <small>{subject.professorName}</small>
                                            </th>
                                        ))}
                                       
                                    </tr>
                                </thead>
                                <tbody>
                                    {questions.map((question, questionIndex) => (
                                        <tr key={questionIndex}>
                                            <td>{questionIndex + 1}</td>
                                            <td id="questions">{question}</td>
                                            {subjects.map((subject, subjectIndex) => (
                                                <td key={subjectIndex}>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="5"
                                                        id={`input-${subjectIndex}-${questionIndex}`} // Add unique ID for each input
                                                        value={subjects[subjectIndex].ratings[questionIndex]?.rating || ''}
                                                        required={true}
                                                        onChange={(e) =>
                                                            handleRatingChange(subjectIndex, questionIndex, e.target.value)
                                                        }
                                                        onKeyDown={(e) =>
                                                            handleKeyDown(
                                                                e,
                                                                `input-${subjectIndex}-${questionIndex + 1}` // Focus next question
                                                            )
                                                        }
                                                        className={fieldWarnings.ratings ? 'warning' : ''} // Add warning class if needed
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {fieldWarnings.ratings && <span className="warning-text">{fieldWarnings.ratings}</span>}
                        <div>
                            <h5>Comments:</h5>
                            <textarea
                                placeholder="Comments"
                                style={{ width: '40%', height: '20px' }}
                                onChange={(e) => handleCommentChange('general', e.target.value)}
                            />
                        </div>
                    </div>
                )}
                <button type="submit" style={{ padding:"10px"}}>Submit Feedback</button>
            </form>
        </div>
        </>
    );
};

export default FeedbackForm;
