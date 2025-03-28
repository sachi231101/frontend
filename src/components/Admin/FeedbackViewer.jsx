import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx'; // Import XLSX for Excel generation
import './FeedbackViewer.css';
const FeedbackViewer = () => {
    const [course, setCourse] = useState('');
    const [professor, setProfessor] = useState('');
    const [semester, setSemester] = useState(''); // Add state for semester
    const [feedbacks, setFeedbacks] = useState([]);
    const [courses, setCourses] = useState([]);
    const [professors, setProfessors] = useState([]);
    const [semesters, setSemesters] = useState([]); // Add state for semesters
    const [averageRating, setAverageRating] = useState(null); // Add state for average rating
    const [year, setYear] = useState(''); // Add state for year
    const [years, setYears] = useState([]); // Add state for available years
    const [feedbackType, setFeedbackType] = useState(''); // Add state for feedback type
    const [feedbackTypes, setFeedbackTypes] = useState([]); // Add state for feedback types

    useEffect(() => {
        // Fetch courses, professors, and semesters
        const fetchData = async () => {
            try {
                const coursesAndProfessorsResponse = await axios.get('http://localhost:5000/api/feedback/courses-and-professors');
                setCourses(coursesAndProfessorsResponse.data.courses || []);
                setProfessors(coursesAndProfessorsResponse.data.professors || []);

                const semestersResponse = await axios.get('http://localhost:5000/api/feedback/semesters');
                setSemesters(semestersResponse.data || []); // Set semesters
            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        // Fetch professors when a course is selected
        const fetchProfessorsByCourse = async () => {
            if (!course) {
                setProfessors([]); // Clear professors if no course is selected
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/api/feedback/professors-by-course', {
                    params: { course }, // Send the selected course to the backend
                });
                setProfessors(response.data || []); // Set professors for the selected course
            } catch (error) {
                console.error('Error fetching professors by course:', error.message);
            }
        };

        fetchProfessorsByCourse();
    }, [course]); // Trigger when the course changes

    useEffect(() => {
        // Fetch semesters when a course is selected
        const fetchSemestersByCourse = async () => {
            if (!course) {
                setSemesters([]); // Clear semesters if no course is selected
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/api/feedback/semesters-by-course', {
                    params: { course }, // Send the selected course to the backend
                });
                setSemesters(response.data || []); // Set semesters for the selected course
            } catch (error) {
                console.error('Error fetching semesters by course:', error.message);
            }
        };

        fetchSemestersByCourse();
    }, [course]); // Trigger when the course changes

    useEffect(() => {
        // Fetch years
        const fetchYears = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/feedback/years');
                setYears(response.data || []); // Set available years
            } catch (error) {
                console.error('Error fetching years:', error.message);
            }
        };
        fetchYears();
    }, []);

    useEffect(() => {
        // Fetch feedback types
        const fetchFeedbackTypes = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/feedback/feedback-types');
                setFeedbackTypes(response.data || []); // Set feedback types
            } catch (error) {
                console.error('Error fetching feedback types:', error.message);
            }
        };
        fetchFeedbackTypes();
    }, []);

    const handleFilterChange = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/feedback/filtered-feedback-with-average', {
                params: { course, professor: professor || null, semester: semester || null, year, feedbackType }, // Include feedbackType in filters
            });
            console.log('Filtered feedbacks:', response.data); // Debug log to verify data
            setFeedbacks(response.data.feedbacks || []); // Set only filtered feedbacks
            setAverageRating(response.data.averageRating || null); // Set average rating
        } catch (error) {
            console.error('Error fetching filtered feedbacks:', error.message);
        }
    };

    const handleDownloadReport = () => {
        if (feedbacks.length === 0) {
            console.error('No data available to download.');
            return;
        }
    
        // Prepare data for Excel
        const data = feedbacks.flatMap((feedback) =>
            feedback.feedback.map((subjectFeedback) => ({
                'Student Name': feedback.student.name,
                USN: feedback.student.usn,
                Course: feedback.student.course,
                Semester: feedback.semester,
                Subject: subjectFeedback.subject,
                Professor: subjectFeedback.professorName,
                Ratings: subjectFeedback.ratings.join(', '),
                Comments: feedback.comments,
            }))
        );
    
        // Add footer row for average rating
        if (averageRating !== null) {
            data.push({
                'Student Name': '',
                USN: '',
                Course: '',
                Semester: '',
                Subject: '',
                Professor: 'Average Rating',
                Ratings: `${averageRating.toFixed(2)}%`,
                Comments: '',
            });
        }
    
        // Create a worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedback Report');
    
        // Generate Excel file and trigger download
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Feedback_Report_${professor}_${semester}_${year}.xlsx`); // Include year in filename
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const handleRefresh = () => {
        setCourse('');
        setProfessor('');
        setSemester('');
        setYear('');
        setFeedbacks([]);
        setAverageRating(null);
        console.log('Filters and feedback data reset.'); // Debug log
    };

    return (
        <div className="feedback-viewer-container">
            <h2 className="feedback-viewer-title">Feedback Viewer</h2>
            <div className="filter-container">
            <div className="filter-section">
                <select className="filter-select" value={year} onChange={(e) => setYear(e.target.value)}>
                    <option value="">-- Select Year --</option>
                    {years.map((yr, index) => (
                        <option key={index} value={yr}>
                            {yr}
                        </option>
                    ))}
                </select>
            </div>
            <div className="filter-section">
                <select className="filter-select" value={course} onChange={(e) => setCourse(e.target.value)}>
                    <option value="">-- Select Course --</option>
                    {courses.map((courseItem, index) => (
                        <option key={index} value={courseItem}>
                            {courseItem}
                        </option>
                    ))}
                </select>
            </div>
            <div className="filter-section">
                <select className="filter-select" value={professor} onChange={(e) => setProfessor(e.target.value)} disabled={!course}>
                    <option value="">-- Select Professor --</option>
                    {professors.map((prof, index) => (
                        <option key={index} value={prof}>
                            {prof}
                        </option>
                    ))}
                </select>
            </div>
            <div className="filter-section">
                <select className="filter-select" value={semester} onChange={(e) => setSemester(e.target.value)} disabled={!course}>
                    <option value="">-- Select Semester --</option>
                    {semesters.map((sem, index) => (
                        <option key={index} value={sem}>
                            {sem}
                        </option>
                    ))}
                </select>
            </div>
            <div className="filter-section">
                <select className="filter-select" value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)}>
                    <option value="">-- Select Feedback Type --</option>
                    {feedbackTypes.map((type, index) => (
                        <option key={index} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>
            <button className="apply-filters-button" onClick={handleFilterChange} disabled={!course}>
                Apply Filters
            </button>
            <button className="refresh-button" onClick={handleRefresh}>
                Refresh
            </button>
            </div>
            <div className="feedbacks-section">
                <h3 className="feedbacks-title">Feedbacks</h3>
                {feedbacks.length > 0 ? (
                    <table className="feedbacks-table" border="1">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>USN</th>
                                <th>Course</th>
                                <th>Semester</th>
                                <th>Subject</th>
                                <th>Professor</th>
                                <th>Ratings</th>
                                <th>Comments</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feedbacks.map((feedback, index) => (
                                feedback.feedback.map((subjectFeedback, subIndex) => (
                                    <tr key={`${index}-${subIndex}`}>
                                        <td>{feedback.student.name}</td>
                                        <td>{feedback.student.usn}</td>
                                        <td>{feedback.student.course}</td>
                                        <td>{feedback.semester}</td>
                                        <td>{subjectFeedback.subject}</td>
                                        <td>{subjectFeedback.professorName}</td>
                                        <td>{subjectFeedback.ratings.join(', ')}</td>
                                        <td>{feedback.comments}</td>
                                    </tr>
                                ))
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="6">Average Rating</td>
                                <td colSpan="2">{averageRating !== null ? `${averageRating.toFixed(2)}%` : ''}</td>
                            </tr>
                            </tfoot>   
                    </table>
                ) : (
                    <p className="no-feedbacks-message">No feedbacks available for the selected filters.</p>
                )}
                {feedbacks.length > 0 && (
                    <button className="download-report-button" onClick={handleDownloadReport}>
                        Download Excel Report
                    </button>
                )}
            </div>
        </div>
    );
};

export default FeedbackViewer;
