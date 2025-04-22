import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Chip,
    IconButton,
    ToggleButtonGroup,
    ToggleButton
} from '@mui/material';
import { format, parseISO, isWithinInterval, addDays } from 'date-fns';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/auth';
import { alpha } from '@mui/material/styles';

const UpcomingMilestones = () => {
    const [upcomingJobs, setUpcomingJobs] = useState([]);
    const [daysRange, setDaysRange] = useState(13);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUpcomingJobs();
    }, [daysRange]);

    const fetchUpcomingJobs = async () => {
        try {
            const response = await fetchWithAuth('http://localhost:7315/api/jobs/');

            if (response.ok) {
                const jobs = await response.json();
                const now = new Date();
                const futureDate = addDays(now, daysRange);

                const upcoming = jobs
                    .filter(job =>
                        job.next_milestone_date &&
                        job.application_status !== 'rejected' &&
                        isWithinInterval(parseISO(job.next_milestone_date), {
                            start: now,
                            end: futureDate
                        })
                    )
                    .sort((a, b) =>
                        new Date(a.next_milestone_date) - new Date(b.next_milestone_date)
                    );
                setUpcomingJobs(upcoming);
            }
        } catch (error) {
            console.error('Error fetching upcoming jobs:', error);
        }
    };

    const handleRangeChange = (event, newRange) => {
        if (newRange !== null) {
            setDaysRange(newRange);
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

    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    Upcoming Milestones {upcomingJobs.length > 0 && `(${upcomingJobs.length})`}
                </Typography>
                <ToggleButtonGroup
                    value={daysRange}
                    exclusive
                    onChange={handleRangeChange}
                    size="small"
                    aria-label="days range"
                >
                    <ToggleButton value={3} aria-label="3 days">
                        3d
                    </ToggleButton>
                    <ToggleButton value={7} aria-label="7 days">
                        7d
                    </ToggleButton>
                    <ToggleButton value={14} aria-label="14 days">
                        14d
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
            {upcomingJobs.length === 0 ? (
                <Typography color="text.secondary">
                    No upcoming milestones in the next {daysRange} days
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
                    {upcomingJobs.map((job) => (
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
                                borderLeft: theme =>
                                    job.next_milestone_date &&
                                        parseISO(job.next_milestone_date).getTime() === new Date().setHours(0, 0, 0, 0) ?
                                        `4px solid ${theme.palette.success.main}` :
                                        'none',
                                pl: job.next_milestone_date &&
                                    parseISO(job.next_milestone_date).getTime() === new Date().setHours(0, 0, 0, 0) ?
                                    2.5 : 3,
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
                                        Due: {format(parseISO(job.next_milestone_date), 'MMM d, yyyy')}
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
                    ))}
                </List>
            )}
        </Paper>
    );
};

export default UpcomingMilestones; 