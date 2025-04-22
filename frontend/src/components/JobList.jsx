import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { Chip } from '@mui/material';

const JobList = () => {
    const theme = useTheme();
    const [jobs, setJobs] = useState([]);

    const getStatusColor = (status) => {
        const colors = {
            not_yet_applied: 'default',
            applied: 'primary',
            test_task: 'secondary',
            screening_call: 'info',
            interview: 'warning',
            offer: 'success',
            rejected: 'error',
            no_answer: 'error'  // Using error color with custom styling
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

    useEffect(() => {
        // Fetch jobs from API
    }, []);

    return (
        <div>
            {jobs.map(job => (
                <Chip
                    key={job.id}
                    label={formatStatus(job.status)}
                    color={getStatusColor(job.status)}
                    style={getChipStyle(job.status)}
                />
            ))}
        </div>
    );
};

export default JobList; 