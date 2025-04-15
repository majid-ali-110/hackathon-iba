// Student data service with mock data generation for educational progress tracking
import { faker } from '@faker-js/faker';

// Random data generation utilities
const generateRandomScore = () => Math.floor(Math.random() * 101); // 0-100
const generateRandomProgress = () => Math.floor(Math.random() * (100 - 30 + 1) + 30); // 30-100%
const generateRandomGrade = () => {
  const grades = ['A', 'B', 'C', 'D', 'F'];
  const weights = [0.2, 0.3, 0.3, 0.15, 0.05]; // Weighted distribution
  
  let random = Math.random();
  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) {
      return grades[i];
    }
    random -= weights[i];
  }
  return grades[0];
};

// Generate assessment data for a student
const generateAssessments = () => {
  const numberOfAssessments = Math.floor(Math.random() * 8) + 3; // 3-10 assessments
  const assessments = [];
  
  for (let i = 0; i < numberOfAssessments; i++) {
    assessments.push({
      id: i + 1,
      name: faker.helpers.arrayElement([
        'Quiz', 'Midterm', 'Final Exam', 'Project', 'Assignment', 
        'Presentation', 'Lab Work', 'Essay', 'Research Paper'
      ]) + ' ' + (i + 1),
      score: generateRandomScore(),
      outOf: 100,
      date: faker.date.recent(90).toISOString().split('T')[0],
      improvement: Math.random() > 0.5 ? Math.floor(Math.random() * 25) + 1 : 0
    });
  }
  
  return assessments;
};

// Generate subjects for a student
const generateSubjects = () => {
  const subjects = [
    'Mathematics', 'Science', 'History', 'English Literature', 'Computer Science',
    'Physics', 'Chemistry', 'Biology', 'Economics', 'Geography', 'Art', 'Music',
    'Foreign Language', 'Physical Education', 'Social Studies'
  ];
  
  const numberOfSubjects = Math.floor(Math.random() * 5) + 4; // 4-8 subjects
  const studentSubjects = [];
  
  const selectedSubjects = faker.helpers.arrayElements(subjects, numberOfSubjects);
  
  selectedSubjects.forEach(subject => {
    studentSubjects.push({
      id: faker.string.uuid(),
      name: subject,
      grade: generateRandomGrade(),
      progress: generateRandomProgress(),
      assessments: generateAssessments(),
      strengths: faker.helpers.arrayElements([
        'Critical thinking', 'Problem solving', 'Creativity', 'Attention to detail',
        'Analytical skills', 'Memorization', 'Application of concepts', 'Research skills'
      ], Math.floor(Math.random() * 3) + 1),
      weaknesses: faker.helpers.arrayElements([
        'Time management', 'Test anxiety', 'Conceptual understanding', 'Homework completion',
        'Class participation', 'Note taking', 'Organization', 'Focus during lectures'
      ], Math.floor(Math.random() * 3) + 1)
    });
  });
  
  return studentSubjects;
};

// Generate a list of 20 random students with educational data
const generateStudents = () => {
  const students = [];
  
  for (let i = 0; i < 20; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    students.push({
      id: faker.string.uuid(),
      studentId: `S${faker.number.int({min: 10000, max: 99999})}`,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: faker.internet.email({firstName, lastName}),
      avatar: faker.image.avatar(),
      grade: Math.floor(Math.random() * 5) + 8, // Grades 8-12
      age: Math.floor(Math.random() * 5) + 14, // Ages 14-18
      attendance: Math.floor(Math.random() * 10) + 90, // 90-99%
      overallGPA: (Math.random() * 2 + 2).toFixed(2), // 2.00-4.00
      subjects: generateSubjects(),
      learningStyle: faker.helpers.arrayElement([
        'Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing',
        'Multimodal', 'Verbal', 'Logical', 'Social', 'Solitary'
      ]),
      recentProgress: {
        trend: faker.helpers.arrayElement(['improving', 'steady', 'declining']),
        percentage: generateRandomProgress()
      },
      lastUpdated: faker.date.recent(14).toISOString()
    });
  }
  
  return students;
};

// Mock student data (generated once and cached)
let studentData = null;

// Public API
export const studentDataService = {
  // Get all students
  getAllStudents: () => {
    if (!studentData) {
      studentData = generateStudents();
    }
    return Promise.resolve(studentData);
  },
  
  // Get a single student by ID
  getStudentById: (id) => {
    if (!studentData) {
      studentData = generateStudents();
    }
    const student = studentData.find(s => s.id === id);
    return Promise.resolve(student || null);
  },
  
  // Get overall class performance metrics
  getClassMetrics: () => {
    if (!studentData) {
      studentData = generateStudents();
    }
    
    const avgGPA = studentData.reduce((sum, student) => sum + parseFloat(student.overallGPA), 0) / studentData.length;
    const avgAttendance = studentData.reduce((sum, student) => sum + student.attendance, 0) / studentData.length;
    
    // Calculate subject performance
    const subjects = {};
    studentData.forEach(student => {
      student.subjects.forEach(subject => {
        if (!subjects[subject.name]) {
          subjects[subject.name] = {
            totalGradePoints: 0,
            count: 0,
            grades: { A: 0, B: 0, C: 0, D: 0, F: 0 }
          };
        }
        
        subjects[subject.name].grades[subject.grade]++;
        subjects[subject.name].count++;
        subjects[subject.name].totalGradePoints += 
          subject.grade === 'A' ? 4 :
          subject.grade === 'B' ? 3 :
          subject.grade === 'C' ? 2 :
          subject.grade === 'D' ? 1 : 0;
      });
    });
    
    const subjectPerformance = Object.keys(subjects).map(name => ({
      name,
      averageGrade: (subjects[name].totalGradePoints / subjects[name].count).toFixed(2),
      gradeDistribution: subjects[name].grades,
      studentCount: subjects[name].count
    }));
    
    return Promise.resolve({
      totalStudents: studentData.length,
      averageGPA: avgGPA.toFixed(2),
      averageAttendance: avgAttendance.toFixed(2),
      subjectPerformance,
      improvingStudents: studentData.filter(s => s.recentProgress.trend === 'improving').length,
      decliningStudents: studentData.filter(s => s.recentProgress.trend === 'declining').length
    });
  },
  
  // Generate a progress report for a specific student
  generateStudentReport: (studentId) => {
    if (!studentData) {
      studentData = generateStudents();
    }
    
    // Add console.log to debug the issue
    console.log('Generating report for student ID:', studentId);
    console.log('Available student IDs:', studentData.map(s => s.id));
    
    const student = studentData.find(s => s.id === studentId);
    if (!student) {
      console.error('Student not found with ID:', studentId);
      return Promise.resolve(null);
    }
    
    // Calculate trends and insights
    const strengths = new Set();
    const weaknesses = new Set();
    const subjectPerformance = student.subjects.map(subject => {
      // Add all strengths and weaknesses
      subject.strengths.forEach(s => strengths.add(s));
      subject.weaknesses.forEach(w => weaknesses.add(w));
      
      // Calculate average assessment score
      const avgScore = subject.assessments.reduce((sum, a) => sum + a.score, 0) / subject.assessments.length;
      
      return {
        name: subject.name,
        grade: subject.grade,
        progress: subject.progress,
        averageScore: avgScore.toFixed(1),
        assessments: subject.assessments
      };
    });
    
    // Generate recommendations based on performance
    const recommendations = [];
    if (student.attendance < 95) {
      recommendations.push('Improve class attendance to ensure no content is missed');
    }
    
    if (student.recentProgress.trend === 'declining') {
      recommendations.push('Schedule a one-on-one session to address recent decline in performance');
    }
    
    if (Array.from(weaknesses).includes('Time management')) {
      recommendations.push('Work on time management skills with weekly planning sessions');
    }
    
    // Add subject-specific recommendations
    const lowPerformingSubjects = student.subjects.filter(s => s.grade === 'D' || s.grade === 'F');
    if (lowPerformingSubjects.length > 0) {
      lowPerformingSubjects.forEach(subject => {
        recommendations.push(`Additional support needed in ${subject.name} (Current grade: ${subject.grade})`);
      });
    }
    
    // Generate report
    const report = {
      studentInfo: {
        id: student.id,
        studentId: student.studentId,
        name: student.fullName,
        grade: student.grade,
        age: student.age,
        avatar: student.avatar
      },
      academicSummary: {
        gpa: student.overallGPA,
        attendance: student.attendance,
        learningStyle: student.learningStyle,
        recentProgressTrend: student.recentProgress.trend,
        recentProgressPercentage: student.recentProgress.percentage
      },
      strengths: Array.from(strengths),
      areasForImprovement: Array.from(weaknesses),
      subjectPerformance,
      recommendations,
      generatedDate: new Date().toISOString(),
      reportPeriod: 'Spring 2025'
    };
    
    return Promise.resolve(report);
  }
};