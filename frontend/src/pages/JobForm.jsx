import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Typography,
    Box,
    Grid,
    TextField,
    Button,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Alert,
    Paper,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { fetchWithAuth, API_BASE_URL } from '../utils/auth';

const JOB_SOURCES = [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'indeed', label: 'Indeed' },
    { value: 'company_website', label: 'Company Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'other', label: 'Other' },
];

const APPLICATION_STATUSES = [
    { value: 'not_yet_applied', label: 'Not Yet Applied' },
    { value: 'applied', label: 'Applied' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'test_task', label: 'Test Task' },
    { value: 'screening_call', label: 'Screening Call' },
    { value: 'interview', label: 'Interview' },
    { value: 'offer', label: 'Offer' },
];

function JobForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        company_name: '',
        role_title: '',
        vacancy_link: '',
        vacancy_text: '',
        application_status: 'not_yet_applied',
        date_applied: null,
        next_milestone_date: null,
        salary_min: '',
        salary_max: '',
        source: 'other',
    });

    useEffect(() => {
        if (id) {
            fetchJob();
        }
    }, [id]);

    const fetchJob = async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/jobs/${id}/`);

            if (response.ok) {
                const jobData = await response.json();
                setFormData({
                    ...jobData,
                    date_applied: jobData.date_applied ? new Date(jobData.date_applied) : null,
                    next_milestone_date: jobData.next_milestone_date ? new Date(jobData.next_milestone_date) : null,
                    salary_min: jobData.salary_min?.toString() || '',
                    salary_max: jobData.salary_max?.toString() || '',
                });
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to fetch job');
            }
        } catch (err) {
            setError('An error occurred while fetching the job');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const submissionData = {
                ...formData,
                date_applied: formData.date_applied ? new Date(formData.date_applied).toISOString() : null,
                next_milestone_date: formData.next_milestone_date ? new Date(formData.next_milestone_date).toISOString() : null,
                salary_min: formData.salary_min ? Number(formData.salary_min) : null,
                salary_max: formData.salary_max ? Number(formData.salary_max) : null
            };

            const url = id
                ? `${API_BASE_URL}/api/jobs/${id}/`
                : `${API_BASE_URL}/api/jobs/`;

            const response = await fetchWithAuth(url, {
                method: id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });

            if (response.ok) {
                navigate('/jobs');
            } else {
                const errorData = await response.json();
                setError(errorData.error || `Failed to ${id ? 'update' : 'create'} job`);
            }
        } catch (err) {
            setError(`An error occurred while ${id ? 'updating' : 'creating'} the job`);
        }
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
            <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4
                }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 600,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {id ? 'Edit Job' : 'Add New Job'}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/jobs')}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                minWidth: 100
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                minWidth: 100
                            }}
                        >
                            {id ? 'Save Changes' : 'Add Job'}
                        </Button>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Basic Information */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                                Basic Information
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Company Name"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Role Title"
                                    name="role_title"
                                    value={formData.role_title}
                                    onChange={handleChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                                <FormControl fullWidth>
                                    <InputLabel>Source</InputLabel>
                                    <Select
                                        name="source"
                                        value={formData.source}
                                        label="Source"
                                        onChange={handleChange}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {JOB_SOURCES.map(source => (
                                            <MenuItem key={source.value} value={source.value}>
                                                {source.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Grid>

                        {/* Application Status */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                                Application Status
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        name="application_status"
                                        value={formData.application_status}
                                        label="Status"
                                        onChange={handleChange}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        {APPLICATION_STATUSES.map(status => (
                                            <MenuItem key={status.value} value={status.value}>
                                                {status.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        label="Date Applied"
                                        value={formData.date_applied}
                                        onChange={(value) => handleDateChange('date_applied', value)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                    },
                                                }
                                            }
                                        }}
                                    />
                                    <DatePicker
                                        label="Next Milestone Date"
                                        value={formData.next_milestone_date}
                                        onChange={(value) => handleDateChange('next_milestone_date', value)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                    },
                                                }
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>
                        </Grid>

                        {/* Salary Information */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                                Salary Information
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Minimum Salary"
                                    name="salary_min"
                                    type="number"
                                    value={formData.salary_min}
                                    onChange={handleChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Maximum Salary"
                                    name="salary_max"
                                    type="number"
                                    value={formData.salary_max}
                                    onChange={handleChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Box>
                        </Grid>

                        {/* Vacancy Link */}
                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                                Vacancy Link
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Vacancy Link"
                                    name="vacancy_link"
                                    value={formData.vacancy_link}
                                    onChange={handleChange}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Box>
                        </Grid>

                        {/* Vacancy Text - Full Width */}
                        <Grid item xs={12} sx={{ width: '-webkit-fill-available' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                                Vacancy Text
                            </Typography>
                            <TextField
                                fullWidth
                                label="Vacancy Text"
                                name="vacancy_text"
                                multiline
                                rows={8}
                                value={formData.vacancy_text}
                                onChange={handleChange}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    },
                                    '& .MuiInputBase-input': {
                                        fontSize: '1rem',
                                        lineHeight: 1.6,
                                        resize: 'vertical',
                                        minHeight: '8em',
                                        cursor: 'ns-resize'
                                    },
                                    '& .MuiOutlinedInput-multiline': {
                                        padding: 0,
                                    },
                                    '& textarea': {
                                        padding: '14px',
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
}

export default JobForm;


