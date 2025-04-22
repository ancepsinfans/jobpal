import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    IconButton,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { API_BASE_URL } from '../utils/auth';

const statusColors = {
    not_yet_applied: 'default',
    applied: 'info',
    rejected: 'error',
    test_task: 'warning',
    screening_call: 'primary',
    interview: 'secondary',
    offer: 'success',
};

function JobList() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [filters, setFilters] = useState({
        status: '',
        roleTitle: '',
        minSalary: '',
        maxSalary: '',
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json();
            setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;

        try {
            await fetch(`${API_BASE_URL}/api/jobs/${id}/`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            fetchJobs();
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    };

    const filteredJobs = jobs.filter(job => {
        return (
            (!filters.status || job.application_status === filters.status) &&
            (!filters.roleTitle || job.role_title.toLowerCase().includes(filters.roleTitle.toLowerCase())) &&
            (!filters.minSalary || job.salary_min >= parseInt(filters.minSalary)) &&
            (!filters.maxSalary || job.salary_max <= parseInt(filters.maxSalary))
        );
    });

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Job Applications
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filters.status}
                                label="Status"
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="not_yet_applied">Not Yet Applied</MenuItem>
                                <MenuItem value="applied">Applied</MenuItem>
                                <MenuItem value="rejected">Rejected</MenuItem>
                                <MenuItem value="test_task">Test Task</MenuItem>
                                <MenuItem value="screening_call">Screening Call</MenuItem>
                                <MenuItem value="interview">Interview</MenuItem>
                                <MenuItem value="offer">Offer</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Role Title"
                            value={filters.roleTitle}
                            onChange={(e) => setFilters({ ...filters, roleTitle: e.target.value })}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Min Salary"
                            type="number"
                            value={filters.minSalary}
                            onChange={(e) => setFilters({ ...filters, minSalary: e.target.value })}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Max Salary"
                            type="number"
                            value={filters.maxSalary}
                            onChange={(e) => setFilters({ ...filters, maxSalary: e.target.value })}
                        />
                    </Grid>
                </Grid>
            </Box>

            <Grid container spacing={2}>
                {filteredJobs.map((job) => (
                    <Grid item xs={12} key={job.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="h6" gutterBottom>
                                            {job.role_title} at {job.company_name}
                                        </Typography>

                                        <Box sx={{ mb: 2 }}>
                                            <Chip
                                                label={job.application_status.replace(/_/g, ' ').toUpperCase()}
                                                color={statusColors[job.application_status]}
                                                sx={{ mr: 1 }}
                                            />
                                            {job.source && (
                                                <Chip
                                                    label={job.source.replace(/_/g, ' ').toUpperCase()}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            )}
                                        </Box>

                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            {job.vacancy_text ? job.vacancy_text.slice(0, 200) + '...' : 'No description available'}
                                        </Typography>

                                        {(job.salary_min || job.salary_max) && (
                                            <Typography variant="body2" color="text.secondary">
                                                Salary Range: ${job.salary_min || 'N/A'} - ${job.salary_max || 'N/A'}
                                            </Typography>
                                        )}

                                        {job.date_applied && (
                                            <Typography variant="body2" color="text.secondary">
                                                Applied: {new Date(job.date_applied).toLocaleDateString()}
                                            </Typography>
                                        )}

                                        {job.next_milestone_date && (
                                            <Typography variant="body2" color="text.secondary">
                                                Next Milestone: {new Date(job.next_milestone_date).toLocaleDateString()}
                                            </Typography>
                                        )}
                                    </Box>

                                    <Box>
                                        <IconButton onClick={() => navigate(`/edit/${job.id}`)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(job.id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default JobList; 