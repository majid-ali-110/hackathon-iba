import { GoogleGenerativeAI } from '@google/generative-ai';

class ChatbotService {
  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key is not set in environment variables');
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Update to use Gemini 2.0 Flash model
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash"
      });
      console.log('Gemini model initialized successfully');
    } catch (error) {
      console.error('Error initializing Gemini:', error);
    }

    this.systemPrompts = {
      student: `You are an educational AI assistant helping students with their studies. 
      Provide clear, concise, and accurate answers. Break down complex topics into 
      understandable parts. Encourage critical thinking and provide relevant examples.
      Always maintain a friendly and encouraging tone. If a concept is complex,
      break it down into smaller, digestible parts.
      
      Format your responses using markdown:
      - Use # for main headings and ## for subheadings
      - Use **bold** for emphasis
      - Use \`code\` for inline code and \`\`\` for code blocks (include language name)
      - Use bulleted and numbered lists where appropriate
      - Use > for quotes or important information
      - Use [text](URL) for links when referencing resources
      - Use tables for comparing information when relevant`,
      
      teacher: `You are an educational AI assistant helping teachers track student progress 
      and generate reports. Provide analytical insights and suggestions for improvement. 
      Help create personalized learning plans and identify areas where students need support.
      Focus on actionable insights and data-driven recommendations.
      
      Format your responses using markdown:
      - Use # for main headings and ## for subheadings
      - Use **bold** for emphasis
      - Use \`code\` for inline code and \`\`\` for code blocks (include language name)
      - Use bulleted and numbered lists where appropriate
      - Use > for quotes or important information
      - Use [text](URL) for links when referencing resources
      - Use tables for comparing information when relevant`
    };

    this.conversationHistory = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  async retry(fn, retries = this.maxRetries) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        console.log(`Attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, i)));
      }
    }
  }

  async startChat(userRole) {
    return this.retry(async () => {
      try {
        console.log('Starting new chat with role:', userRole);
        const chat = this.model.startChat({
          history: [
            {
              role: "user",
              parts: [{ text: "Please act as an educational assistant with the following context: " + this.systemPrompts[userRole] }]
            },
            {
              role: "model",
              parts: [{ text: "I understand. I'll act as an educational assistant according to the guidelines you've provided. How can I help you today?" }]
            }
          ]
        });
        console.log('Chat created successfully');
        return chat;
      } catch (error) {
        console.error('Error starting chat:', error);
        throw error;
      }
    });
  }

  async sendMessage(message, userRole, userId = 'default') {
    return this.retry(async () => {
      try {
        if (!this.genAI || !this.model) {
          throw new Error('Gemini client not initialized');
        }

        console.log(`Sending message for user ${userId} with role ${userRole}`);
        
        if (!this.conversationHistory.has(userId)) {
          console.log('No existing chat found, creating new chat');
          const chat = await this.startChat(userRole);
          this.conversationHistory.set(userId, chat);
        }

        const chat = this.conversationHistory.get(userId);
        
        try {
          console.log('Sending message to Gemini:', message);
          const result = await chat.sendMessage([{ text: message }]);
          const response = await result.response;
          const content = response.text();
          
          console.log('Received response from Gemini');
          
          // Process content to improve formatting
          const formattedContent = this.formatResponse(content);
          
          return { message: formattedContent };
        } catch (error) {
          console.error('Chat error details:', error);
          if (error.message?.includes('SAFETY')) {
            return {
              message: "I apologize, but I cannot provide an answer to that query due to safety constraints. Please try rephrasing your question in a more academic context."
            };
          }
          throw error;
        }
      } catch (error) {
        console.error('Error in Gemini response:', error);
        throw new Error(error.message || 'Failed to get response from AI');
      }
    });
  }

  formatResponse(content) {
    // Handle empty or undefined content
    if (!content) return '';
    
    // Remove excessive newlines but preserve paragraph breaks
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // Make sure headers have a space after the # symbols
    content = content.replace(/^(#{1,6})([^#\s])/gm, '$1 $2');
    
    // Ensure lists are properly formatted with spacing
    content = content.replace(/^(\s*[-*+])([^\s])/gm, '$1 $2'); // Add space after list markers if missing
    content = content.replace(/^(\s*\d+\.)([^\s])/gm, '$1 $2'); // Add space after numbered list markers if missing
    
    // Ensure code blocks are properly formatted with syntax highlighting
    content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      // Ensure proper language tag for syntax highlighting
      const language = lang ? lang.trim() : '';
      return `\`\`\`${language}\n${code.trim()}\n\`\`\``;
    });
    
    // Fix code blocks that might be missing newlines
    content = content.replace(/```(\w+)?([^\n])/g, '```$1\n$2');
    content = content.replace(/([^\n])```/g, '$1\n```');
    
    // Improve table formatting
    content = content.replace(/\n(\|[^|]+)+\|\n(\|[-|:]+)+\|\n/g, (match) => {
      return '\n' + match.trim() + '\n\n';
    });
    
    // Make sure inline code is properly formatted
    content = content.replace(/`([^`]+)`/g, (match, code) => {
      return '`' + code.trim() + '`';
    });
    
    // Ensure links are properly formatted
    content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      return `[${text.trim()}](${url.trim()})`;
    });
    
    // Ensure quotes are properly formatted
    content = content.replace(/^(>+)([^\s])/gm, '$1 $2'); // Add space after > if missing
    
    // Add proper spacing around headings for better readability
    content = content.replace(/^(#{1,6}\s.+)$/gm, '\n$1\n');
    
    // Add space after horizontal rules for better visibility
    content = content.replace(/^(---|\*\*\*|___)$/gm, '$1\n');
    
    // Ensure proper spacing for lists
    content = content.replace(/^(\s*[-*+]\s.+)$/gm, (match, line) => {
      // Don't add extra newlines if it's part of a list
      if (content.split('\n').filter(l => /^\s*[-*+]\s/.test(l)).length > 1) {
        return line;
      }
      return line + '\n';
    });
    
    // Fix emphasis markers that might be missing spaces
    content = content.replace(/(\w)(\*\*|\*|__|_)(\w)/g, '$1 $2$3');
    content = content.replace(/(\w)(\*\*|\*|__|_)(\w)/g, '$1$2 $3');
    
    // Ensure images are properly formatted
    content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
      return `![${alt.trim()}](${url.trim()})`;
    });
    
    // Remove duplicate blank lines that might have been introduced
    content = content.replace(/\n{3,}/g, '\n\n');
    
    return content.trim();
  }

  async generateReport(studentId) {
    return this.retry(async () => {
      try {
        if (!this.genAI || !this.model) {
          throw new Error('Gemini client not initialized');
        }

        const prompt = `Generate a comprehensive learning progress report for student ID: ${studentId}. 
        Include:
        1. Performance Analysis
        2. Areas of Strength
        3. Areas Needing Improvement
        4. Specific Action Items
        5. Learning Goals
        6. Recommended Resources
        Format the response with clear sections and bullet points where appropriate.`;

        try {
          console.log('Generating report for student:', studentId);
          const result = await this.model.generateContent([{ text: prompt }]);
          const response = await result.response;
          return { summary: this.formatResponse(response.text()) };
        } catch (error) {
          console.error('Generate report error details:', error);
          if (error.message?.includes('SAFETY')) {
            return {
              summary: "Unable to generate report due to safety constraints. Please try with different parameters."
            };
          }
          throw error;
        }
      } catch (error) {
        console.error('Error generating report:', error);
        throw new Error(error.message || 'Failed to generate report');
      }
    });
  }

  async getStudyRecommendations(studentId) {
    return this.retry(async () => {
      try {
        if (!this.genAI || !this.model) {
          throw new Error('Gemini client not initialized');
        }

        const prompt = `Based on the student's performance (ID: ${studentId}), 
        provide personalized study recommendations including:
        1. Specific study strategies
        2. Recommended learning resources
        3. Time management tips
        4. Practice exercises
        5. Additional learning materials
        Format the response with clear sections and bullet points.`;

        try {
          console.log('Getting study recommendations for student:', studentId);
          const result = await this.model.generateContent([{ text: prompt }]);
          const response = await result.response;
          const recommendations = this.formatResponse(response.text())
            .split('\n')
            .filter(line => line.trim());

          return recommendations;
        } catch (error) {
          console.error('Get recommendations error details:', error);
          if (error.message?.includes('SAFETY')) {
            return [
              "Unable to generate recommendations due to safety constraints.",
              "Please try with different parameters."
            ];
          }
          throw error;
        }
      } catch (error) {
        console.error('Error getting recommendations:', error);
        throw new Error(error.message || 'Failed to get recommendations');
      }
    });
  }

  async getStudentProgress(studentId) {
    return this.retry(async () => {
      try {
        if (!this.genAI || !this.model) {
          throw new Error('Gemini client not initialized');
        }

        const prompt = `Provide a detailed progress analysis for student ID: ${studentId}.
        Include:
        1. Current Performance Metrics
        2. Learning Trajectory
        3. Milestone Achievements
        4. Areas of Improvement
        5. Recent Progress Highlights
        Format the response with clear sections and use quantitative measures where possible.`;

        try {
          console.log('Getting progress for student:', studentId);
          const result = await this.model.generateContent([{ text: prompt }]);
          const response = await result.response;
          return { summary: this.formatResponse(response.text()) };
        } catch (error) {
          console.error('Get progress error details:', error);
          if (error.message?.includes('SAFETY')) {
            return {
              summary: "Unable to generate progress analysis due to safety constraints. Please try with different parameters."
            };
          }
          throw error;
        }
      } catch (error) {
        console.error('Error getting progress:', error);
        throw new Error(error.message || 'Failed to get progress data');
      }
    });
  }
}

export default new ChatbotService();