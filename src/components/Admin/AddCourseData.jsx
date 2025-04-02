// AddCourseData.jsx
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios'; // Import axios

const AddCourseData = () => {
  const [courseData, setCourseData] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // Handle Excel file upload and parsing
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      // Transform flat Excel data into nested structure
      const transformedData = {
        name: parsedData[0]?.courseName || '', // Assuming courseName is in Excel
        subjects: parsedData.map(row => ({
          name: row.subjectName,
          semester: row.semester,
          professorName: row.professorName,
          subjectCode: row.subjectCode
        })),
        academicYears: [parsedData[0]?.academicYear || '2023-2024']
      };
      
      setCourseData(transformedData);
    };

    reader.readAsBinaryString(file);
  };

  // Submit to backend
  const handleSubmit = async () => {
    try {
        if (!courseData || !courseData.name || !courseData.subjects || !courseData.academicYears) {
            setUploadStatus('Invalid course data. Ensure all fields are filled.');
            console.error('Invalid course data:', courseData);
            return;
        }
        // Use axios to send the POST request
        const response = await axios.post('http://10.22.2.17:5000/api/addCourse/addCourse', courseData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 201) {
            setUploadStatus('Course data added successfully!');
            setCourseData(null);
        }
    } catch (error) {
        if (error.response) {
            // Backend responded with an error
            setUploadStatus(`Failed to add course data: ${error.response.data.message}`);
            console.error('Backend error response:', error.response.data);
        } else {
            // Network or other errors
            console.error('Error:', error);
            setUploadStatus('Error occurred while uploading. Please check the backend logs.');
        }
    }
  };

  const handleUpdate = async () => {
    try {
        if (!courseData || !courseData.name) {
            setUploadStatus('Invalid course data. Ensure the course name is provided.');
            return;
        }

        const response = await axios.put('http://10.22.2.17:5000/api/addCourse/updateCourse', courseData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 200) {
            setUploadStatus('Course updated successfully!');
            setCourseData(null);
        }
    } catch (error) {
        if (error.response) {
            setUploadStatus(`Failed to update course: ${error.response.data.message}`);
        } else {
            setUploadStatus('Error occurred while updating. Please check the backend logs.');
        }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Add Course Data</h2>
      
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        style={{ margin: '10px 0' }}
      />

      {courseData && (
        <div>
          <h3>Preview Course Data</h3>
          <p><strong>Course:</strong> {courseData.name}</p>
          <p><strong>Academic Year:</strong> {courseData.academicYears[0]}</p>
          
          <table style={{ borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid black', padding: '5px' }}>Subject</th>
                <th style={{ border: '1px solid black', padding: '5px' }}>Semester</th>
                <th style={{ border: '1px solid black', padding: '5px' }}>Professor</th>
                <th style={{ border: '1px solid black', padding: '5px' }}>Subject Code</th>
              </tr>
            </thead>
            <tbody>
              {courseData.subjects.map((subject, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{subject.name}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{subject.semester}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{subject.professorName}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{subject.subjectCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button onClick={handleSubmit}>Upload to Database</button>
          <button onClick={handleUpdate}>Update Course</button>
        </div>
      )}

      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
};

export default AddCourseData;