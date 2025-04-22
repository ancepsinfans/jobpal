import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    LinearProgress,
    IconButton,
    Stack,
    useTheme
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { fetchWithAuth, API_BASE_URL } from '../utils/auth';
import { differenceInDays, parseISO } from 'date-fns';

function RejectionMetrics({ metrics }) {
    const theme = useTheme();
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [extendedMetrics, setExtendedMetrics] = useState({
        totalApplications: 0,
        responseRate: 0,
        stageMetrics: {},
        activeApplications: 0,
        standardDeviation: 0,
        noAnswerThreshold: 0
    });

    useEffect(() => {
        fetchExtendedMetrics();
    }, [metrics]);

    const calculateStandardDeviation = (jobs, mean) => {
        const appliedJobs = jobs.filter(job =>
            job.date_applied &&
            job.application_status !== 'rejected' &&
            job.application_status !== 'offer'
        );

        if (appliedJobs.length === 0) return { standardDeviation: 0, noAnswerThreshold: 0 };

        const squareDiffs = appliedJobs.map(job => {
            const days = differenceInDays(new Date(), parseISO(job.date_applied));
            return Math.pow(days - mean, 2);
        });

        const avgSquareDiff = squareDiffs.reduce((sum, diff) => sum + diff, 0) / squareDiffs.length;
        const standardDeviation = Math.sqrt(avgSquareDiff);
        const noAnswerThreshold = mean + (2 * standardDeviation);

        return { standardDeviation, noAnswerThreshold };
    };

    const fetchExtendedMetrics = async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/jobs/`);
            if (response.ok) {
                const jobs = await response.json();
                const totalApplications = jobs.length;

                // Calculate response rate
                const responsesReceived = jobs.filter(job =>
                    job.application_status !== 'not_yet_applied' &&
                    job.application_status !== 'applied'
                ).length;
                const responseRate = totalApplications > 0
                    ? Math.round((responsesReceived / totalApplications) * 100)
                    : 0;

                // Calculate stage metrics
                const stages = ['screening_call', 'interview', 'test_task', 'offer'];
                const stageMetrics = {};
                stages.forEach(stage => {
                    const reachedStage = jobs.filter(job =>
                        stages.indexOf(job.application_status) >= stages.indexOf(stage)
                    ).length;
                    stageMetrics[stage] = totalApplications > 0
                        ? Math.round((reachedStage / totalApplications) * 100)
                        : 0;
                });

                // Calculate active applications and identify no-answer cases
                const activeJobs = jobs.filter(job =>
                    job.application_status !== 'rejected' &&
                    job.application_status !== 'offer'
                );

                const activeApplications = activeJobs.length;

                // Calculate standard deviation and threshold
                const { standardDeviation, noAnswerThreshold } = calculateStandardDeviation(
                    jobs,
                    metrics.averageDays
                );

                // Update jobs that exceed the threshold
                const jobsToUpdate = activeJobs.filter(job => {
                    if (!job.date_applied) return false;
                    const days = differenceInDays(new Date(), parseISO(job.date_applied));
                    return days > noAnswerThreshold;
                });

                // Update the status of jobs exceeding threshold
                if (jobsToUpdate.length > 0) {
                    jobsToUpdate.forEach(async (job) => {
                        try {
                            await fetchWithAuth(`${API_BASE_URL}/api/jobs/${job.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    ...job,
                                    application_status: 'no_answer'
                                })
                            });
                        } catch (error) {
                            console.error('Error updating job status:', error);
                        }
                    });
                }

                setExtendedMetrics({
                    totalApplications,
                    responseRate,
                    stageMetrics,
                    activeApplications,
                    standardDeviation,
                    noAnswerThreshold
                });
            }
        } catch (error) {
            console.error('Error fetching extended metrics:', error);
        }
    };

    const MetricItem = ({ label, value, unit = '', color }) => (
        <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                    {value}{unit}
                </Typography>
                {unit === '%' && (
                    <Box sx={{ flexGrow: 1, ml: 2 }}>
                        <LinearProgress
                            variant="determinate"
                            value={value}
                            sx={{
                                height: 6,
                                borderRadius: 1,
                                backgroundColor: theme.palette.action.hover,
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: color || theme.palette.primary.main
                                }
                            }}
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );

    const sections = [
        {
            title: "Application Metrics",
            content: (
                <Stack spacing={2}>
                    <MetricItem
                        label="Total Applications"
                        value={extendedMetrics.totalApplications}
                    />
                    <MetricItem
                        label="Active Applications"
                        value={extendedMetrics.activeApplications}
                    />
                    <MetricItem
                        label="Response Rate"
                        value={extendedMetrics.responseRate}
                        unit="%"
                        color={theme.palette.info.main}
                    />
                </Stack>
            )
        },
        {
            title: "Stage Progress",
            content: (
                <Stack spacing={2}>
                    <MetricItem
                        label="Reached Screening"
                        value={extendedMetrics.stageMetrics.screening_call || 0}
                        unit="%"
                        color={theme.palette.primary.light}
                    />
                    <MetricItem
                        label="Reached Interview"
                        value={extendedMetrics.stageMetrics.interview || 0}
                        unit="%"
                        color={theme.palette.secondary.main}
                    />
                    <MetricItem
                        label="Received Offers"
                        value={extendedMetrics.stageMetrics.offer || 0}
                        unit="%"
                        color={theme.palette.success.main}
                    />
                </Stack>
            )
        },
        {
            title: "Rejection Insights",
            content: (
                <Stack spacing={2}>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 3
                    }}>
                        <MetricItem
                            label="Average Time"
                            value={metrics.averageDays}
                            unit=" days"
                        />
                        <MetricItem
                            label="Fastest"
                            value={metrics.fastestRejection}
                            unit=" days"
                        />
                        <MetricItem
                            label="Slowest"
                            value={metrics.slowestRejection}
                            unit=" days"
                        />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                        Applications with no response after {Math.round(extendedMetrics.noAnswerThreshold)} days are marked as "No Answer"
                    </Typography>
                </Stack>
            )
        }
    ];

    const handleNext = () => {
        setCurrentSectionIndex((prev) => (prev + 1) % sections.length);
    };

    const handlePrevious = () => {
        setCurrentSectionIndex((prev) => (prev - 1 + sections.length) % sections.length);
    };

    return (
        <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                    {sections[currentSectionIndex].title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={handlePrevious} size="small">
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={handleNext} size="small">
                        <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            <Box sx={{
                minHeight: '200px',
                transition: 'opacity 0.3s ease-in-out'
            }}>
                {sections[currentSectionIndex].content}
            </Box>

            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 2,
                gap: 0.5
            }}>
                {sections.map((_, index) => (
                    <Box
                        key={index}
                        onClick={() => setCurrentSectionIndex(index)}
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: index === currentSectionIndex ? 'primary.main' : 'action.disabled',
                            transition: 'background-color 0.3s ease-in-out',
                            cursor: 'pointer',
                            '&:hover': {
                                bgcolor: index === currentSectionIndex ? 'primary.main' : 'action.hover'
                            }
                        }}
                    />
                ))}
            </Box>
        </Paper>
    );
}

export default RejectionMetrics; 