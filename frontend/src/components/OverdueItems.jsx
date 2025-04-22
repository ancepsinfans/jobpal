import { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Chip, IconButton } from '@mui/material';
import { format, isPast, parseISO, differenceInDays } from 'date-fns';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth, API_BASE_URL } from '../utils/auth';
import { alpha } from '@mui/material/styles';

const OverdueItems = ({ averageRejectionDays }) => {
    const [overdueJobs, setOverdueJobs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOverdueJobs();
    }, []);

    const fetchOverdueJobs = async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/jobs/`);

            if (response.ok) {
                const jobs = await response.json();
                const overdue = jobs
                    .filter(job =>
                        job.next_milestone_date &&
                        isPast(new Date(job.next_milestone_date)) &&
                        job.application_status !== 'rejected'
                    )
                    .sort((a, b) =>
                        new Date(a.next_milestone_date) - new Date(b.next_milestone_date)
                    );
                setOverdueJobs(overdue);
            }
        } catch (error) {
            console.error('Error fetching overdue jobs:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            not_yet_applied: 'default',
            applied: 'primary',
            test_task: 'secondary',
            screening_call: 'info',
            interview: 'warning',
            offer: 'success',
            rejected: 'error',
            no_answer: 'error'
        };
        return colors[status] || 'default';
    };

    const getChipStyle = (status) => {
        if (status === 'no_answer') {
            return {
                '& .MuiChip-label': {
                    opacity: 0.7
                },
                backgroundColor: alpha(theme.palette.error.main, 0.7),
                '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.8)
                }
            };
        }
        return {};
    };

    const formatStatus = (status) => {
        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const getDaysSinceApplication = (dateApplied) => {
        if (!dateApplied) return 0;
        return differenceInDays(new Date(), parseISO(dateApplied));
    };

    const isExceedingAverageTime = (dateApplied) => {
        return averageRejectionDays > 0 && getDaysSinceApplication(dateApplied) > averageRejectionDays;
    };

    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                Overdue Items {overdueJobs.length > 0 && `(${overdueJobs.length})`}
            </Typography>
            {overdueJobs.length === 0 ? (
                <Typography color="text.secondary">
                    No overdue items
                </Typography>
            ) : (
                <List
                    sx={{
                        width: '100%',
                        maxHeight: '250px',
                        overflow: 'auto',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: theme => theme.palette.action.hover,
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: theme => theme.palette.action.selected,
                        }
                    }}
                >
                    {overdueJobs.map((job) => {
                        const exceededAverage = isExceedingAverageTime(job.date_applied);
                        const daysSinceApplication = getDaysSinceApplication(job.date_applied);

                        return (
                            <ListItem
                                key={job.id}
                                sx={{
                                    borderRadius: 2,
                                    mb: 1,
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 120px 48px',
                                    gap: 2,
                                    alignItems: 'center',
                                    borderLeft: theme => exceededAverage ?
                                        `4px solid ${theme.palette.primary.main}` :
                                        'none',
                                    pl: exceededAverage ? 2.5 : 3, // Adjust padding to account for border
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Typography variant="body1" component="span">
                                            {job.company_name} - {job.role_title}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography variant="body2" color="text.secondary">
                                            {exceededAverage ?
                                                `Applied ${daysSinceApplication} days ago (avg. rejection time - ${averageRejectionDays} days)` :
                                                `Milestone due: ${format(new Date(job.next_milestone_date), 'MMM d, yyyy')}`
                                            }
                                        </Typography>
                                    }
                                    sx={{ minWidth: 0 }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Chip
                                        label={formatStatus(job.application_status)}
                                        size="small"
                                        color={getStatusColor(job.application_status)}
                                        sx={getChipStyle(job.application_status)}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <IconButton
                                        edge="end"
                                        onClick={() => navigate(`/jobs/edit/${job.id}`)}
                                    >
                                        <OpenInNewIcon />
                                    </IconButton>
                                </Box>
                            </ListItem>
                        );
                    })}
                </List>
            )}
        </Paper>
    );
};

export default OverdueItems; 