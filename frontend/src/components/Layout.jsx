import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import MenuIcon from '@mui/icons-material/Menu';
import { useUser } from '../hooks/useUser';
import { isTokenExpired } from '../utils/auth';

function Layout({ children }) {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const { user, loading, error } = useUser();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || isTokenExpired(token)) {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleExport = async () => {
        try {
            const response = await fetch('http://localhost:7315/api/jobs/export', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'jobs.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting jobs:', error);
        }
        handleClose();
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            cursor: 'pointer',
                            minWidth: '100px'
                        }}
                        onClick={() => navigate('/')}
                    >
                        JobPal
                    </Typography>

                    <Box sx={{ textAlign: 'center', minWidth: '200px' }}>
                        {loading ? (
                            <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Loading...
                            </Typography>
                        ) : error ? (
                            <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Error loading user
                            </Typography>
                        ) : user ? (
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    fontWeight: 400,
                                    letterSpacing: '0.02em',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        color: 'rgba(255, 255, 255, 1)',
                                        textDecoration: 'underline'
                                    }
                                }}
                                onClick={() => navigate('/profile')}
                            >
                                {user.first_name} {user.last_name}
                            </Typography>
                        ) : (
                            <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Not logged in
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{
                        display: { xs: 'none', md: 'flex' },
                        gap: 1,
                        minWidth: '100px',
                        justifyContent: 'flex-end'
                    }}>
                        <Button
                            color="inherit"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/jobs/new')}
                        >
                            Add Job
                        </Button>
                        <Button
                            color="inherit"
                            startIcon={<DownloadIcon />}
                            onClick={handleExport}
                        >
                            Export CSV
                        </Button>
                        <Button
                            color="inherit"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </Box>

                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            color="inherit"
                            onClick={handleMenu}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={() => { navigate('/jobs/new'); handleClose(); }}>
                                Add Job
                            </MenuItem>
                            <MenuItem onClick={handleExport}>
                                Export CSV
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Container component="main" sx={{ flex: 1, py: 3 }}>
                {children}
            </Container>

            <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'background.paper' }}>
                <Container maxWidth="sm">
                    <Typography variant="body2" color="text.secondary" align="center">
                        © {new Date().getFullYear()} JobPal
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}

export default Layout; 