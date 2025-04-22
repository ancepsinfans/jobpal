import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Link,
    Alert,
} from '@mui/material';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            console.log('Attempting login with:', { email: formData.email });
            const response = await fetch("http://localhost:7315/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(formData),
                mode: 'cors',
                credentials: 'include',
            });

            console.log('Login response status:', response.status);
            const data = await response.json();
            console.log('Login response data:', data);

            if (response.ok) {
                localStorage.setItem("token", data.access_token);
                navigate("/");
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            console.error('Login error:', err);
            setError("An error occurred during login");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: 'background.default',
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    width: '100%',
                    maxWidth: 400,
                }}
            >
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Login
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        required
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        margin="normal"
                    />

                    <TextField
                        required
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        margin="normal"
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Login
                    </Button>

                    <Typography align="center">
                        Don't have an account?{' '}
                        <Link
                            component="button"
                            variant="body2"
                            onClick={() => navigate('/register')}
                        >
                            Register
                        </Link>
                    </Typography>
                </form>
            </Paper>
        </Box>
    );
}

export default Login; 