import { Typography, Box, Button, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';

function Home() {
    const navigate = useNavigate();

    return (
        <Box sx={{ width: '100%' }}>
            <Typography
                variant="h4"
                component="h1"
                sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                    mb: 4
                }}
            >
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper
                        elevation={2}
                        sx={{
                            p: 3,
                            height: '100%'
                        }}
                    >
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{
                                mb: 3,
                                fontWeight: 500
                            }}
                        >
                            Quick Actions
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/jobs/new')}
                                fullWidth
                                sx={{
                                    py: 1.5,
                                    textTransform: 'none'
                                }}
                            >
                                Add New Job
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<WorkIcon />}
                                onClick={() => navigate('/jobs')}
                                fullWidth
                                sx={{
                                    py: 1.5,
                                    textTransform: 'none'
                                }}
                            >
                                View All Jobs
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper
                        elevation={2}
                        sx={{
                            p: 3,
                            height: '100%',
                            minHeight: '300px'
                        }}
                    >
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{
                                mb: 3,
                                fontWeight: 500
                            }}
                        >
                            Recent Activity
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                textAlign: 'center',
                                mt: 8
                            }}
                        >
                            No recent activity to display
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Home; 