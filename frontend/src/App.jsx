import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobForm from './pages/JobForm';
import Layout from './components/Layout';
import Profile from './pages/Profile';

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
    },
    secondary: {
      main: '#ce93d8',
      light: '#f3e5f5',
      dark: '#ab47bc',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    // Custom status colors
    status: {
      not_yet_applied: {
        main: '#2D333B',
        contrastText: '#FFFFFF',
      },
      applied: {
        main: '#1F6FEB',  // GitHub-like blue
        contrastText: '#FFFFFF',
      },
      rejected: {
        main: '#C93C37',
        contrastText: '#FFFFFF',
      },
      test_task: {
        main: '#966600',
        contrastText: '#FFFFFF',
      },
      screening_call: {
        main: '#8250DF',
        contrastText: '#FFFFFF',
      },
      interview: {
        main: '#8250DF',
        contrastText: '#FFFFFF',
      },
      offer: {
        main: '#347D39',  // Success green
        contrastText: '#FFFFFF',
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 24,
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '0 8px',
          '& .MuiChip-label': {
            padding: '0 4px',
          },
        },
      },
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <Layout>
      {children}
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/new"
              element={
                <ProtectedRoute>
                  <JobForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/edit/:id"
              element={
                <ProtectedRoute>
                  <JobForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
