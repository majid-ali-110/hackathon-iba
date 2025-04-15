import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  CssBaseline, 
  Paper,
  Switch,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Zoom,
  Fade,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import Chatbot from './components/Chatbot';
import StudentReports from './components/StudentReports';
import './App.css';

// Styled components for enhanced UI
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
  boxShadow: '0 4px 20px rgba(106, 17, 203, 0.3)',
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: '30px',
  padding: '8px 20px',
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(5px)',
  transition: 'all 0.3s ease',
  fontWeight: 'bold',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
  }
}));

const RoleSwitchContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '8px 16px',
  borderRadius: '40px',
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  marginRight: theme.spacing(2),
}));

const StyledSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#fff',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#fff',
  },
}));

const Background = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(145deg, #f6f9fc 0%, #eef2f7 100%)',
  zIndex: -1,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-10%',
    right: '-5%',
    width: '25%',
    height: '35%',
    background: 'radial-gradient(circle, rgba(106, 17, 203, 0.2) 0%, rgba(37, 117, 252, 0) 70%)',
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-5%',
    left: '-5%',
    width: '30%',
    height: '40%',
    background: 'radial-gradient(circle, rgba(37, 117, 252, 0.15) 0%, rgba(106, 17, 203, 0) 70%)',
    borderRadius: '50%',
  }
}));

function App() {
  const [userRole, setUserRole] = useState('student'); // 'student' or 'teacher'
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRoleChange = () => {
    setUserRole(prev => prev === 'student' ? 'teacher' : 'student');
  };

  const handleThemeToggle = () => {
    setDarkMode(prev => !prev);
    // In a real app, you'd implement theme switching here
  };

  // Decide which icon to show based on role
  const RoleIcon = userRole === 'student' ? SchoolIcon : PersonIcon;
  
  return (
    <>
      <CssBaseline />
      <Background />
      <Box sx={{ 
        flexGrow: 1, 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        background: darkMode ? 
          'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)' : 
          'transparent',
      }}>
        <StyledAppBar position="static" elevation={3}>
          <Toolbar>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Zoom in={mounted} timeout={800}>
                <Avatar sx={{ 
                  background: 'white',
                  animation: 'pulse 2s infinite',
                }}>
                  <RoleIcon sx={{ color: '#6a11cb' }} />
                </Avatar>
              </Zoom>
              <Fade in={mounted} timeout={1200}>
                <span>EduMate</span>
              </Fade>
            </Typography>
            
            {!isMobile && (
              <Fade in={mounted} timeout={1000}>
                <RoleSwitchContainer>
                  <SchoolIcon sx={{ color: userRole === 'student' ? '#fff' : 'rgba(255,255,255,0.5)', mr: 1 }} />
                  <StyledSwitch checked={userRole === 'teacher'} onChange={handleRoleChange} />
                  <PersonIcon sx={{ color: userRole === 'teacher' ? '#fff' : 'rgba(255,255,255,0.5)', ml: 1 }} />
                </RoleSwitchContainer>
              </Fade>
            )}
            
            <Tooltip title={`Switch to ${darkMode ? 'Light' : 'Dark'} Mode`}>
              <IconButton color="inherit" onClick={handleThemeToggle}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            
            {isMobile && (
              <GradientButton 
                color="inherit"
                onClick={handleRoleChange}
                startIcon={userRole === 'student' ? <PersonIcon /> : <SchoolIcon />}
              >
                {userRole === 'student' ? 'Teacher' : 'Student'}
              </GradientButton>
            )}
          </Toolbar>
        </StyledAppBar>

        <Container sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 4,
          zIndex: 1,
        }}>
          <Fade in={mounted} timeout={800}>
            <Box sx={{ width: '100%', maxWidth: 800 }}>
              <Typography 
                variant="h4" 
                gutterBottom 
                align="center" 
                sx={{ 
                  fontWeight: 'bold',
                  color: darkMode ? 'white' : 'inherit',
                  textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              >
                {userRole === 'student' ? 'Student Learning Assistant' : 'Teacher Dashboard'}
              </Typography>
              <Typography 
                variant="subtitle1" 
                gutterBottom 
                align="center" 
                sx={{ 
                  color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                  mb: 4
                }}
              >
                {userRole === 'student' 
                  ? 'Get personalized help with your studies and excel in your academic journey' 
                  : 'Track student progress, generate reports, and enhance teaching effectiveness'}
              </Typography>
              
              {userRole === 'student' ? (
                <Chatbot userRole={userRole} />
              ) : (
                <>
                  <Chatbot userRole={userRole} />
                  <Box sx={{ mt: 4 }}>
                    <StudentReports />
                  </Box>
                </>
              )}
            </Box>
          </Fade>
        </Container>
      </Box>
    </>
  );
}

export default App;
