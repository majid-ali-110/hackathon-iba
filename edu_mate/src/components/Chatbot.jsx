import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  List, 
  ListItem,
  Menu,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
  Fade,
  Zoom,
  Chip,
  Tooltip,
  Divider,
  Stack,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import WarningIcon from '@mui/icons-material/Warning';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import chatbotService from '../services/chatbotService';
import { marked } from 'marked';

// Styled components for enhanced UI
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: { 
    xs: 'calc(100vh - 80px)',  // Increased height on mobile
    sm: '700px',               // Increased height on tablet
    md: '750px'                // Increased height on desktop
  },
  maxHeight: '95vh',           // Increased from 90vh to 95vh
  width: '100%',               // Full width of container
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)',
  borderRadius: { 
    xs: '16px', 
    sm: '20px' 
  },
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  overflow: 'hidden', // Prevent content from overflowing
  '&:hover': {
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.15)',
    transform: { 
      xs: 'none',     // No hover animation on mobile 
      sm: 'translateY(-5px)' 
    }
  }
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: { xs: '10px', sm: '15px' },
  background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
  color: '#fff',
  boxShadow: '0 4px 10px rgba(106, 17, 203, 0.3)'
}));

const MessageBubble = styled(Paper)(({ type, error, theme }) => ({
  padding: theme.spacing(1.5),
  maxWidth: { 
    xs: '85%',  // Mobile: wider bubbles
    sm: '75%',  // Tablet: medium width
    md: '70%'   // Desktop: more compact
  },
  position: 'relative',
  borderRadius: type === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
  backgroundColor: error 
    ? '#ffcdd2' 
    : type === 'user' 
      ? 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' 
      : 'linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)',
  background: error 
    ? '#ffcdd2' 
    : type === 'user' 
      ? 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' 
      : 'linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)',
  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.15)',
  }
}));

const MessageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  flexGrow: 1, 
  display: 'flex', 
  flexDirection: 'column', 
  overflowY: 'auto',
  overflowX: 'hidden',
  height: 'calc(100% - 100px)', 
  padding: theme.spacing(2), 
  scrollBehavior: 'smooth',

  '&::-webkit-scrollbar': {
    width: '8px',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0,0,0,0.05)',
    borderRadius: '4px',
    margin: '4px 0',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(106, 17, 203, 0.5)',
    borderRadius: '4px',
    border: '2px solid transparent',
    backgroundClip: 'padding-box',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: 'rgba(106, 17, 203, 0.7)',
    border: '2px solid transparent',
    backgroundClip: 'padding-box',
  },

  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'thin',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '30px',
    transition: 'all 0.3s ease',
    backgroundColor: '#f5f7fa',
    fontSize: {
      xs: '0.875rem',
      sm: '1rem'
    },
    padding: {
      xs: theme.spacing(0.5, 1),
      sm: 'initial'
    },
    height: {
      xs: '48px',
      sm: '56px'
    },
    '&:hover': {
      backgroundColor: '#ffffff',
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 3px rgba(106, 17, 203, 0.2)',
    }
  },
  '& .MuiOutlinedInput-input': {
    padding: {
      xs: theme.spacing(1, 1.5),
      sm: theme.spacing(1.5, 2)
    }
  },
  // Add touch-friendly input focus styles for mobile
  '@media (pointer: coarse)': {
    '& .MuiOutlinedInput-root': {
      height: '56px', // Slightly larger on touch devices
    },
    '& .MuiOutlinedInput-input': {
      padding: theme.spacing(1.5, 2),
    },
    '&.Mui-focused': {
      transform: 'scale(1.01)', // Subtle scale effect on touch focus
    }
  }
}));

const SendButton = styled(Button)(({ theme }) => ({
  borderRadius: '50%',
  minWidth: { xs: '48px', sm: '56px' },
  height: { xs: '48px', sm: '56px' },
  padding: 0,
  background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  boxShadow: '0 4px 10px rgba(106, 17, 203, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #6a11cb 20%, #2575fc 100%)',
    boxShadow: '0 6px 15px rgba(106, 17, 203, 0.4)',
    transform: 'translateY(-2px) scale(1.05)',
  },
  '&:disabled': {
    background: '#bdbdbd',
  }
}));

const ActionChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  color: 'white',
  fontWeight: 'bold',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  fontSize: { xs: '0.75rem', sm: '0.875rem' },
  height: { xs: '28px', sm: '32px' },
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-2px)',
  }
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(2),
  zIndex: 2,
  background: 'white',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    background: '#f5f5f5',
  }
}));

const Chatbot = ({ userRole }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentStudentId, setCurrentStudentId] = useState('student123');
  const [error, setError] = useState(null);
  const [apiConfigured, setApiConfigured] = useState(true);
  const messagesEndRef = useRef(null);
  const messageContainerRef = useRef(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const inputRef = useRef(null);
  
  // Pagination state for messages
  const [displayedMessages, setDisplayedMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 5;

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Check if API is configured
    setApiConfigured(chatbotService.isConfigured);
    
    // Add welcome message based on role and API configuration
    let welcomeMessage;
    
    if (!chatbotService.isConfigured) {
      welcomeMessage = "⚠️ API configuration issue: The AI service requires a valid API key to function properly. Please check the application setup instructions.";
      setError("API key not properly configured");
    } else {
      welcomeMessage = userRole === 'student' 
        ? "Hi! I'm your study assistant. How can I help you today?"
        : "Welcome, teacher! I can help you track student progress and generate reports.";
    }
    
    setMessages([{ type: 'bot', content: welcomeMessage, error: !chatbotService.isConfigured }]);
    
    // Focus input on load if API is configured
    if (chatbotService.isConfigured) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, [userRole]);

  useEffect(() => {
    // When messages change, update the displayed messages
    const startIndex = Math.max(0, messages.length - (currentPage * messagesPerPage));
    const endIndex = messages.length;
    const slicedMessages = messages.slice(startIndex, endIndex);
    setDisplayedMessages(slicedMessages);
    
    // Always show the most recent page when new messages are added
    if (messages.length > 0) {
      setCurrentPage(1);
    }
  }, [messages]);

  useEffect(() => {
    // Update displayed messages when page changes
    const startIndex = Math.max(0, messages.length - (currentPage * messagesPerPage));
    const endIndex = messages.length;
    const slicedMessages = messages.slice(startIndex, endIndex);
    setDisplayedMessages(slicedMessages);
  }, [currentPage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, displayedMessages, isTyping]);

  const handleShowMoreMessages = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleShowNewerMessages = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRetry = async (messageIndex) => {
    const messageToRetry = messages[messageIndex];
    if (messageToRetry.type === 'user') {
      setRetryCount(prev => prev + 1);
      await handleSend(messageToRetry.content);
    }
  };

  const handleSend = async (retryMessage = null) => {
    const messageContent = retryMessage || input;
    if (!messageContent.trim()) return;

    // Check if API is configured before sending message
    if (!chatbotService.isConfigured) {
      setError("The AI service requires a valid API key. Please check the application setup instructions.");
      return;
    }

    const userMessage = { type: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);
    setShowSuggestions(false);

    try {
      const response = await chatbotService.sendMessage(messageContent, userRole);
      
      // Handle error in the response
      if (response.error) {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: response.message,
          error: true
        }]);
      } else {
        setMessages(prev => [...prev, { type: 'bot', content: response.message }]);
      }
      
      // Show suggestions again after bot response
      setTimeout(() => {
        setShowSuggestions(true);
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Sorry, I encountered an error. Please try again.',
        error: true
      }]);
      
      // Show suggestions again after error
      setTimeout(() => {
        setShowSuggestions(true);
      }, 1000);
    }

    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  const handleGenerateReport = async () => {
    // Check if API is configured before generating report
    if (!chatbotService.isConfigured) {
      setError("The AI service requires a valid API key. Please check the application setup instructions.");
      return;
    }
    
    handleMenuClose();
    setIsTyping(true);
    setError(null);
    setShowSuggestions(false);
    
    try {
      const report = await chatbotService.generateReport(currentStudentId);
      
      // Handle error in the response
      if (report.error) {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: report.summary,
          error: true
        }]);
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: `Report generated successfully! Here's the summary:\n\n${report.summary}` 
        }]);
      }
      
      // Show suggestions again after bot response
      setTimeout(() => {
        setShowSuggestions(true);
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Failed to generate the report. Please try again.',
        error: true
      }]);
      
      // Show suggestions again after error
      setTimeout(() => {
        setShowSuggestions(true);
      }, 1000);
    }
    
    setIsTyping(false);
  };

  const handleGetRecommendations = async () => {
    // Check if API is configured before getting recommendations
    if (!chatbotService.isConfigured) {
      setError("The AI service requires a valid API key. Please check the application setup instructions.");
      return;
    }
    
    handleMenuClose();
    setIsTyping(true);
    setError(null);
    setShowSuggestions(false);
    
    try {
      const recommendations = await chatbotService.getStudyRecommendations(currentStudentId);
      
      // Check if the first recommendation is an error message (chatbotService returns an array with error message)
      if (recommendations.length === 1 && recommendations[0].includes("not properly configured")) {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: recommendations[0],
          error: true
        }]);
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: `Here are your personalized study recommendations:\n\n${recommendations.join('\n')}` 
        }]);
      }
      
      // Show suggestions again after bot response
      setTimeout(() => {
        setShowSuggestions(true);
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Failed to get recommendations. Please try again.',
        error: true
      }]);
      
      // Show suggestions again after error
      setTimeout(() => {
        setShowSuggestions(true);
      }, 1000);
    }
    
    setIsTyping(false);
  };

  const handleCheckProgress = async () => {
    // Check if API is configured before checking progress
    if (!chatbotService.isConfigured) {
      setError("The AI service requires a valid API key. Please check the application setup instructions.");
      return;
    }
    
    handleMenuClose();
    setIsTyping(true);
    setError(null);
    setShowSuggestions(false);
    
    try {
      const progress = await chatbotService.getStudentProgress(currentStudentId);
      
      // Handle error in the response
      if (progress.error) {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: progress.summary,
          error: true
        }]);
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: `Here's your current progress:\n\n${progress.summary}` 
        }]);
      }
      
      // Show suggestions again after bot response
      setTimeout(() => {
        setShowSuggestions(true);
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'Failed to fetch progress data. Please try again.',
        error: true
      }]);
      
      // Show suggestions again after error
      setTimeout(() => {
        setShowSuggestions(true);
      }, 1000);
    }
    
    setIsTyping(false);
  };

  // Suggested questions based on user role
  const suggestions = userRole === 'student' 
    ? [
        "Help me understand quantum physics",
        "What are good study techniques?",
        "Give me tips for my math exam"
      ]
    : [
        "How can I improve student engagement?", 
        "Generate a performance analysis",
        "Best teaching methods for online classes"
      ];

  // Calculate whether pagination buttons should be shown
  const showMoreButton = messages.length > messagesPerPage * currentPage;
  const showNewerButton = currentPage > 1;

  const parseMarkdown = (markdown) => {
    return marked(markdown);
  };

  const renderMessageContainer = () => (
    <MessageContainer ref={messageContainerRef}>
      {showNewerButton && (
        <NavigationButton 
          size="small" 
          onClick={handleShowNewerMessages}
          sx={{ top: 0 }}
        >
          <KeyboardArrowUpIcon />
        </NavigationButton>
      )}
      
      <Stack spacing={1.5} sx={{ px: 1, pt: 1, pb: showMoreButton ? 5 : 1 }}>
        {displayedMessages.map((message, index) => (
          <Fade in={true} key={index} timeout={500}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
              }}
            >
              {message.type !== 'user' && (
                <Avatar sx={{ 
                  mr: 1, 
                  background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                  width: 36,
                  height: 36,
                }}>
                  <SmartToyIcon fontSize="small" />
                </Avatar>
              )}
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: message.type === 'user' ? 'flex-end' : 'flex-start' }}>
                <MessageBubble 
                  type={message.type} 
                  error={message.error}
                >
                  {message.type === 'user' ? (
                    <Typography 
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        color: 'white'
                      }}
                    >
                      {message.content}
                    </Typography>
                  ) : (
                    <Box sx={{ 
                      color: 'black',
                      '& a': { color: '#2575fc', textDecoration: 'underline' },
                      '& code': { 
                        backgroundColor: 'rgba(0,0,0,0.07)', 
                        padding: '2px 4px', 
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '0.9em'
                      },
                      '& pre': { 
                        backgroundColor: 'transparent', 
                        padding: '0', 
                        borderRadius: '8px',
                        overflowX: 'auto',
                        margin: '8px 0'
                      },
                      '& pre code': {
                        backgroundColor: 'transparent',
                        padding: 0,
                        display: 'block',
                        lineHeight: 1.5
                      },
                      '& ul, & ol': { paddingLeft: '20px', margin: '8px 0' },
                      '& li': { marginBottom: '4px' },
                      '& p': { margin: '8px 0' },
                      '& h1, & h2, & h3, & h4, & h5, & h6': { 
                        fontWeight: 'bold',
                        marginTop: '16px',
                        marginBottom: '8px' 
                      },
                      '& blockquote': {
                        borderLeft: '4px solid #6a11cb',
                        paddingLeft: '16px',
                        margin: '8px 0',
                        fontStyle: 'italic',
                        color: 'rgba(0,0,0,0.7)'
                      },
                      '& table': {
                        borderCollapse: 'collapse',
                        width: '100%',
                        margin: '16px 0'
                      },
                      '& th, & td': {
                        border: '1px solid #ddd',
                        padding: '8px'
                      },
                      '& th': {
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        fontWeight: 'bold'
                      },
                      '& img': {
                        maxWidth: '100%',
                        borderRadius: '8px',
                        margin: '8px 0'
                      }
                    }}
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                    />
                  )}
                </MessageBubble>
                
                <Typography variant="caption" sx={{ mt: 0.5, color: '#9e9e9e' }}>
                  {message.type === 'user' ? 'You' : 'EduMate'} • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Typography>
              </Box>
              
              {message.type === 'user' && (
                <Avatar sx={{ 
                  ml: 1, 
                  background: userRole === 'student' ? '#ff9800' : '#4caf50',
                  width: 36,
                  height: 36,
                }}>
                  {userRole === 'student' ? <SchoolIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                </Avatar>
              )}
              
              {message.error && (
                <Tooltip title="Retry last message">
                  <IconButton
                    size="small"
                    onClick={() => handleRetry(displayedMessages.indexOf(message) - 1)}
                    sx={{ ml: 1, background: '#f5f5f5', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                  >
                    <RefreshIcon fontSize="small" color="error" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Fade>
        ))}
        
        {isTyping && (
          <Fade in={true} timeout={300}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
            }}>
              <Avatar sx={{ 
                mr: 1, 
                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                width: 36,
                height: 36,
              }}>
                <SmartToyIcon fontSize="small" />
              </Avatar>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 1.5, 
                  borderRadius: '18px 18px 18px 0',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1 
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={16} thickness={6} sx={{ color: '#6a11cb' }} />
                  <Typography sx={{ ml: 1 }}>Thinking<span className="typing-dots">...</span></Typography>
                </Box>
              </Paper>
            </Box>
          </Fade>
        )}
        
        {showSuggestions && messages.length > 0 && !isTyping && (
          <Fade in={true} timeout={800}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', my: 2 }}>
              <Typography variant="caption" sx={{ width: '100%', textAlign: 'center', mb: 1, color: '#757575' }}>
                Try asking:
              </Typography>
              {suggestions.map((suggestion, idx) => (
                <Zoom in={true} key={idx} style={{ transitionDelay: `${idx * 100}ms` }}>
                  <ActionChip
                    label={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    clickable
                    variant="outlined"
                  />
                </Zoom>
              ))}
            </Box>
          </Fade>
        )}
      </Stack>
      
      {showMoreButton && (
        <NavigationButton 
          size="small" 
          onClick={handleShowMoreMessages}
          sx={{ bottom: 0 }}
        >
          <KeyboardArrowDownIcon />
        </NavigationButton>
      )}
    </MessageContainer>
  );

  // Add API configuration warning if needed
  const renderApiWarning = () => {
    if (!chatbotService.isConfigured) {
      return (
        <Alert 
          severity="warning" 
          variant="filled"
          sx={{ 
            mb: 2, 
            borderRadius: '12px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.15)',
          }}
          icon={<WarningIcon />}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            API Key Not Configured
          </Typography>
          <Typography variant="body2">
            This application requires a Gemini API key to function properly. Please add your API key to the .env file.
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Link 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ color: 'white', textDecoration: 'underline', fontWeight: 'bold' }}
            >
              Get a Gemini API key
            </Link>
          </Box>
        </Alert>
      );
    }
    return null;
  };

  return (
    <Zoom in={true} timeout={700}>
      <StyledPaper elevation={3}>
        <ChatHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ background: 'white' }}>
              <SmartToyIcon sx={{ color: '#6a11cb' }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              EduMate Assistant
            </Typography>
            <Chip 
              label={userRole === 'student' ? 'Student Mode' : 'Teacher Mode'} 
              size="small" 
              icon={userRole === 'student' ? <SchoolIcon /> : <PersonIcon />}
              sx={{ ml: 1, background: 'rgba(255, 255, 255, 0.2)' }}
            />
          </Box>
          <Tooltip title="Actions Menu">
            <IconButton onClick={handleMenuClick} sx={{ color: 'white' }}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                borderRadius: '12px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.15)',
              }
            }}
          >
            {userRole === 'student' ? (
              <MenuItem onClick={handleGetRecommendations} sx={{ gap: 1 }}>
                <EmojiObjectsIcon color="primary" />
                Get Study Recommendations
              </MenuItem>
            ) : (
              <MenuItem onClick={handleGenerateReport} sx={{ gap: 1 }}>
                <AssessmentIcon color="primary" />
                Generate Report
              </MenuItem>
            )}
            <MenuItem onClick={handleCheckProgress} sx={{ gap: 1 }}>
              <BarChartIcon color="primary" />
              Check Progress
            </MenuItem>
          </Menu>
        </ChatHeader>
        
        {renderApiWarning()}
        {renderMessageContainer()}

        <Divider sx={{ mb: 2, opacity: 0.6 }} />
        
        <Box sx={{ display: 'flex', gap: 1, px: 1 }}>
          <StyledTextField
            fullWidth
            variant="outlined"
            placeholder={chatbotService.isConfigured ? "Type your message..." : "API key not configured..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isTyping || !chatbotService.isConfigured}
            inputRef={inputRef}
            InputProps={{
              sx: {
                pr: 1.5,
                pl: 2.5,
              }
            }}
          />
          <SendButton
            color="primary"
            onClick={() => handleSend()}
            disabled={isTyping || !input.trim() || !chatbotService.isConfigured}
          >
            <SendIcon />
          </SendButton>
        </Box>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setError(null)} 
            severity="error" 
            sx={{ 
              width: '100%', 
              borderRadius: '12px',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.15)',
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      </StyledPaper>
    </Zoom>
  );
};

export default Chatbot;