import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import ApplicationCalendar from '../components/ApplicationCalendar';
import OverdueItems from '../components/OverdueItems';
import RejectionMetrics from '../components/RejectionMetrics';
import UpcomingMilestones from '../components/UpcomingMilestones';
import { fetchWithAuth, API_BASE_URL } from '../utils/auth';
import { differenceInDays, parseISO } from 'date-fns';

function Home() {
    const navigate = useNavigate();
    const [rejectionMetrics, setRejectionMetrics] = useState({
        averageDays: 0,
        totalRejections: 0,
        fastestRejection: Infinity,
        slowestRejection: 0
    });

    useEffect(() => {
        fetchRejectionData();
    }, []);

    const fetchRejectionData = async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/jobs/`);

            if (response.ok) {
                const jobs = await response.json();
                const rejectedJobs = jobs.filter(job =>
                    job.application_status === 'rejected' &&
                    job.date_applied
                );

                if (rejectedJobs.length === 0) {
                    setRejectionMetrics({
                        averageDays: 0,
                        totalRejections: 0,
                        fastestRejection: 0,
                        slowestRejection: 0
                    });
                    return;
                }

                const rejectionTimes = rejectedJobs.map(job => {
                    const applicationDate = parseISO(job.date_applied);
                    const rejectionDate = parseISO(job.next_milestone_date);
                    return differenceInDays(rejectionDate, applicationDate);
                }).filter(days => days >= 0);

                const totalDays = rejectionTimes.reduce((sum, days) => sum + days, 0);
                const averageDays = Math.round(totalDays / rejectionTimes.length);
                const fastestRejection = Math.min(...rejectionTimes);
                const slowestRejection = Math.max(...rejectionTimes);

                setRejectionMetrics({
                    averageDays,
                    totalRejections: rejectedJobs.length,
                    fastestRejection,
                    slowestRejection
                });
            }
        } catch (error) {
            console.error('Error fetching rejection data:', error);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 500 }}>
                Dashboard
            </Typography>

            <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/jobs/new')}
                >
                    Add New Job
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<WorkIcon />}
                    onClick={() => navigate('/jobs')}
                >
                    View All Jobs
                </Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' }, gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <UpcomingMilestones />
                    <OverdueItems averageRejectionDays={rejectionMetrics.averageDays} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <ApplicationCalendar />

                    <RejectionMetrics metrics={rejectionMetrics} />
                </Box>
            </Box>
        </Box>
    );
}

export default Home; 