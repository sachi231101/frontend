// AddStudentData.jsx
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios'; // Import axios

const AddStudentData = () => {
  const [excelData, setExcelData] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');

  // Handle file upload and parse Excel data
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      console.log('Parsed Data:', parsedData); // Debugging log to check parsed data
      setExcelData(parsedData);
    };

    reader.readAsBinaryString(file);
  };

  // Submit data to backend
  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/addstudents/addStudents', {
        students: excelData, // Wrap data in an object
      });

      if (response.status === 201) {
        setUploadStatus('Students added successfully!');
        setExcelData([]);
      } else {
        setUploadStatus(`Failed to add students: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setUploadStatus('Error occurred while uploading');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Add Student Data</h2>
      
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        style={{ margin: '10px 0' }}
      />

      {excelData.length > 0 && (
        <div>
          <h3>Preview Data</h3>
          <table style={{ borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid black', padding: '5px' }}>Name</th>
                <th style={{ border: '1px solid black', padding: '5px' }}>USN</th>
                <th style={{ border: '1px solid black', padding: '5px' }}>Password</th>
                <th style={{ border: '1px solid black', padding: '5px' }}>Course</th>
                <th style={{ border: '1px solid black', padding: '5px' }}>Year</th>
              </tr>
            </thead>
            <tbody>
              {excelData.map((student, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{student.name}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{student.usn}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{student.password}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{student.course}</td>
                  <td style={{ border: '1px solid black', padding: '5px' }}>{student.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button onClick={handleSubmit}>Upload to Database</button>
        </div>
      )}

      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
};

export default AddStudentData;