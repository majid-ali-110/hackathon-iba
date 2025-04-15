import { useState, useEffect } from 'react';
import { studentDataService } from '../services/studentDataService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const GRADE_COLORS = {
  'A': '#4CAF50',
  'B': '#8BC34A',
  'C': '#FFC107',
  'D': '#FF9800',
  'F': '#F44336'
};

const StudentReports = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classMetrics, setClassMetrics] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentReport, setStudentReport] = useState(null);
  const [view, setView] = useState('overview'); 

  useEffect(() => {
    const loadData = async () => {
      try {
        const allStudents = await studentDataService.getAllStudents();
        const metrics = await studentDataService.getClassMetrics();
        
        setStudents(allStudents);
        setClassMetrics(metrics);
        setLoading(false);
      } catch (error) {
        console.error('Error loading student data:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setView('student');
  };

  const handleGenerateReport = async (studentId) => {
    setLoading(true);
    try {
      const report = await studentDataService.generateStudentReport(studentId);
      setStudentReport(report);
      setView('report');
      setLoading(false);
    } catch (error) {
      console.error('Error generating student report:', error);
      setLoading(false);
    }
  };

  const getAttendanceData = (attendance) => {
    return [
      { name: 'Present', value: attendance },
      { name: 'Absent', value: 100 - attendance }
    ];
  };

  const getSubjectGradeData = (subjects) => {
    return subjects.map(subject => ({
      name: subject.name,
      grade: subject.grade === 'A' ? 4 :
             subject.grade === 'B' ? 3 :
             subject.grade === 'C' ? 2 :
             subject.grade === 'D' ? 1 : 0,
      progress: subject.progress,
      letterGrade: subject.grade
    }));
  };

  const ClassOverview = () => (
    <div className="class-metrics">
      <h2>Class Performance Overview</h2>
      
      <div className="metrics-summary">
        <div className="metric-card">
          <h3>Students</h3>
          <p className="metric-value">{classMetrics.totalStudents}</p>
        </div>
        <div className="metric-card">
          <h3>Average GPA</h3>
          <p className="metric-value">{classMetrics.averageGPA}</p>
        </div>
        <div className="metric-card">
          <h3>Average Attendance</h3>
          <p className="metric-value">{classMetrics.averageAttendance}%</p>
        </div>
        <div className="metric-card">
          <h3>Improving</h3>
          <p className="metric-value">{classMetrics.improvingStudents} students</p>
        </div>
        <div className="metric-card">
          <h3>Needs Attention</h3>
          <p className="metric-value">{classMetrics.decliningStudents} students</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h3>Subject Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={classMetrics.subjectPerformance}
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis domain={[0, 4]} />
              <Tooltip formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : value, 'Average Grade Point']} />
              <Bar dataKey="averageGrade" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="student-list-container">
        <h3>Student List</h3>
        <div className="student-list">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Grade</th>
                <th>GPA</th>
                <th>Attendance</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className={student.recentProgress.trend === 'declining' ? 'student-declining' : ''}>
                  <td>{student.studentId}</td>
                  <td>{student.fullName}</td>
                  <td>{student.grade}</td>
                  <td>{student.overallGPA}</td>
                  <td>{student.attendance}%</td>
                  <td>
                    <span className={`trend trend-${student.recentProgress.trend}`}>
                      {student.recentProgress.trend === 'improving' ? '↑' : 
                       student.recentProgress.trend === 'declining' ? '↓' : '→'} 
                      {student.recentProgress.percentage}%
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleViewStudent(student)}>View</button>
                    <button onClick={() => handleGenerateReport(student.id)}>Report</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const StudentView = () => {
    const subjectData = getSubjectGradeData(selectedStudent.subjects);
    
    return (
      <div className="student-view">
        <button className="back-button" onClick={() => setView('overview')}>← Back to Class</button>
        
        <div className="student-header">
          <div className="student-avatar">
            <img src={selectedStudent.avatar} alt={selectedStudent.fullName} />
          </div>
          <div className="student-info">
            <h2>{selectedStudent.fullName}</h2>
            <p>Student ID: {selectedStudent.studentId}</p>
            <p>Grade: {selectedStudent.grade} | Age: {selectedStudent.age}</p>
            <p>GPA: {selectedStudent.overallGPA} | Attendance: {selectedStudent.attendance}%</p>
            <p>Learning Style: {selectedStudent.learningStyle}</p>
          </div>
          <div className="student-actions">
            <button onClick={() => handleGenerateReport(selectedStudent.id)}>Generate Progress Report</button>
          </div>
        </div>

        <div className="charts-row">
          <div className="chart-card">
            <h3>Subject Grades</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={subjectData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis domain={[0, 4]} />
                <Tooltip formatter={(value, name) => {
                  if (name === 'grade') {
                    return [['F', 'D', 'C', 'B', 'A'][value], 'Grade'];
                  }
                  return [value, name];
                }} />
                <Bar dataKey="grade" fill="#8884d8">
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.letterGrade]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Subject Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart outerRadius={90} data={subjectData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar name="Progress" dataKey="progress" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Attendance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getAttendanceData(selectedStudent.attendance)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {getAttendanceData(selectedStudent.attendance).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4CAF50' : '#F44336'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="subject-details">
          <h3>Subject Details</h3>
          <div className="subject-cards">
            {selectedStudent.subjects.map(subject => (
              <div key={subject.id} className="subject-card">
                <div className="subject-header" style={{ backgroundColor: GRADE_COLORS[subject.grade] }}>
                  <h4>{subject.name}</h4>
                  <span className="subject-grade">{subject.grade}</span>
                </div>
                <div className="subject-content">
                  <p>Progress: {subject.progress}%</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${subject.progress}%`, backgroundColor: GRADE_COLORS[subject.grade] }}></div>
                  </div>
                  <h5>Recent Assessments:</h5>
                  <ul className="assessment-list">
                    {subject.assessments.slice(0, 3).map(assessment => (
                      <li key={assessment.id}>
                        {assessment.name}: {assessment.score}/{assessment.outOf} 
                        {assessment.improvement > 0 && <span className="improvement"> +{assessment.improvement}%</span>}
                      </li>
                    ))}
                  </ul>
                  <div className="subject-attributes">
                    <div className="strengths">
                      <h5>Strengths:</h5>
                      <ul>
                        {subject.strengths.map((strength, idx) => (
                          <li key={idx}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="weaknesses">
                      <h5>Areas for Improvement:</h5>
                      <ul>
                        {subject.weaknesses.map((weakness, idx) => (
                          <li key={idx}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const StudentReportView = () => (
    <div className="report-view">
      <div className="report-actions">
        <button onClick={() => setView('overview')}>← Back to Class</button>
        <button onClick={() => setView('student')}>View Student Profile</button>
        <button>Print Report</button>
      </div>

      <div className="report-container">
        <div className="report-header">
          <h2>Student Progress Report</h2>
          <div className="report-meta">
            <p>Student: {studentReport.studentInfo.name} (ID: {studentReport.studentInfo.studentId})</p>
            <p>Grade: {studentReport.studentInfo.grade} | Report Period: {studentReport.reportPeriod}</p>
            <p>Generated: {new Date(studentReport.generatedDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="report-section">
          <h3>Academic Summary</h3>
          <div className="summary-cards">
            <div className="summary-card">
              <h4>GPA</h4>
              <p className="summary-value">{studentReport.academicSummary.gpa}</p>
            </div>
            <div className="summary-card">
              <h4>Attendance</h4>
              <p className="summary-value">{studentReport.academicSummary.attendance}%</p>
            </div>
            <div className="summary-card">
              <h4>Learning Style</h4>
              <p className="summary-value">{studentReport.academicSummary.learningStyle}</p>
            </div>
            <div className="summary-card">
              <h4>Progress Trend</h4>
              <p className={`summary-value trend-${studentReport.academicSummary.recentProgressTrend}`}>
                {studentReport.academicSummary.recentProgressTrend === 'improving' ? '↑' : 
                 studentReport.academicSummary.recentProgressTrend === 'declining' ? '↓' : '→'} 
                {studentReport.academicSummary.recentProgressPercentage}%
              </p>
            </div>
          </div>
        </div>

        <div className="report-section">
          <h3>Subject Performance</h3>
          <table className="report-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Grade</th>
                <th>Progress</th>
                <th>Average Score</th>
              </tr>
            </thead>
            <tbody>
              {studentReport.subjectPerformance.map((subject, idx) => (
                <tr key={idx}>
                  <td>{subject.name}</td>
                  <td style={{ color: GRADE_COLORS[subject.grade] }}>{subject.grade}</td>
                  <td>
                    <div className="mini-progress">
                      <div 
                        className="mini-progress-fill" 
                        style={{ 
                          width: `${subject.progress}%`, 
                          backgroundColor: GRADE_COLORS[subject.grade] 
                        }}
                      ></div>
                    </div>
                    <span>{subject.progress}%</span>
                  </td>
                  <td>{subject.averageScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="report-columns">
          <div className="report-section">
            <h3>Strengths</h3>
            <ul className="report-list">
              {studentReport.strengths.map((strength, idx) => (
                <li key={idx}>{strength}</li>
              ))}
            </ul>
          </div>

          <div className="report-section">
            <h3>Areas for Improvement</h3>
            <ul className="report-list">
              {studentReport.areasForImprovement.map((area, idx) => (
                <li key={idx}>{area}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="report-section">
          <h3>Recommendations</h3>
          <ul className="report-list recommendations">
            {studentReport.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>

        <div className="report-footer">
          <p>This report is generated by EduMate. For questions, please contact the student's advisor.</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading">Loading student data...</div>;
  }

  return (
    <div className="student-reports-container">
      <h1>Student Progress Tracker</h1>
      
      {view === 'overview' && classMetrics && <ClassOverview />}
      {view === 'student' && selectedStudent && <StudentView />}
      {view === 'report' && studentReport && <StudentReportView />}
    </div>
  );
};

export default StudentReports;