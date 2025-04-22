import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    TextField,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    ClickAwayListener,
    Stack,
    TableSortLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';
import { fetchWithAuth, API_BASE_URL } from '../utils/auth';
import { alpha, useTheme } from '@mui/material/styles';

const statusColors = {
    not_yet_applied: 'status.not_yet_applied',
    applied: 'status.applied',
    rejected: 'status.rejected',
    test_task: 'status.test_task',
    screening_call: 'status.screening_call',
    interview: 'status.interview',
    offer: 'status.offer',
};

const statusLabels = {
    not_yet_applied: 'Not Yet Applied',
    applied: 'Applied',
    rejected: 'Rejected',
    test_task: 'Test Task',
    screening_call: 'Screening Call',
    interview: 'Interview',
    offer: 'Offer',
};

function Jobs() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [editingCell, setEditingCell] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [cursorPosition, setCursorPosition] = useState(null);
    const [orderBy, setOrderBy] = useState('company_name');
    const [order, setOrder] = useState('asc');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/jobs/`);

            if (response.ok) {
                const data = await response.json();
                setJobs(data);
            } else {
                const error = await response.json();
                setError(error.message || 'Failed to fetch jobs');
            }
        } catch (err) {
            setError('An error occurred while fetching jobs');
        }
    };

    const handleDelete = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job?')) {
            return;
        }

        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/jobs/${jobId}/`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchJobs();
            } else {
                const error = await response.json();
                setError(error.message || 'Failed to delete job');
            }
        } catch (err) {
            setError('An error occurred while deleting the job');
        }
    };

    const handleStartEdit = (jobId, field, value) => {
        setEditingCell({ jobId, field });
        setEditValue(value);
        setCursorPosition(null);
    };

    const handleSaveEdit = async (jobId, { field, value }) => {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/api/jobs/${jobId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    [field]: value,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                throw new Error(errorData.error || 'Failed to update job');
            }

            const data = await response.json();
            console.log('Success response:', data);
            await fetchJobs();
        } catch (err) {
            console.error('Full error:', err);
            setError(err.message || 'An error occurred while updating the job');
        }
    };

    const handleCancelEdit = () => {
        setEditingCell(null);
        setEditValue('');
        setCursorPosition(null);
    };

    const StatusCell = ({ jobId, value }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [tempValue, setTempValue] = useState(value);

        const handleStatusChange = (newValue) => {
            setTempValue(newValue);
            handleSaveEdit(jobId, {
                field: 'application_status',
                value: newValue
            });
            setIsOpen(false);
        };

        if (!isOpen) {
            return (
                <TableCell
                    onClick={() => setIsOpen(true)}
                    sx={{
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        },
                        height: '52px',
                        verticalAlign: 'middle',
                    }}
                >
                    <Chip
                        label={statusLabels[value]}
                        sx={{
                            bgcolor: theme => theme.palette.status[value].main,
                            color: theme => theme.palette.status[value].contrastText,
                            '&:hover': {
                                opacity: 0.9,
                            },
                        }}
                    />
                </TableCell>
            );
        }

        return (
            <TableCell
                padding="none"
                sx={{
                    height: '52px',
                    verticalAlign: 'middle',
                }}
            >
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        p: 1,
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                    }}
                >
                    <Select
                        autoFocus
                        open={true}
                        value={tempValue}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        onClose={() => setIsOpen(false)}
                        size="small"
                        sx={{ minWidth: 120 }}
                    >
                        {Object.entries(statusLabels).map(([value, label]) => (
                            <MenuItem key={value} value={value}>
                                {label}
                            </MenuItem>
                        ))}
                    </Select>
                </Stack>
            </TableCell>
        );
    };

    const EditableCell = ({ jobId, field, value, type = 'text' }) => {
        const isEditing = editingCell?.jobId === jobId && editingCell?.field === field;
        const textFieldRef = React.useRef(null);

        React.useEffect(() => {
            // Restore cursor position after value update
            if (textFieldRef.current && cursorPosition !== null) {
                textFieldRef.current.setSelectionRange(cursorPosition, cursorPosition);
            }
        }, [editValue, cursorPosition]);

        const formatValueForSubmission = (val) => {
            if (!val) return null;
            if (type === 'date') {
                return new Date(val).toISOString();
            }
            return val;
        };

        const handleTextChange = (e) => {
            const newValue = e.target.value;
            const newPosition = e.target.selectionStart;
            setEditValue(newValue);
            setCursorPosition(newPosition);
        };

        const handleSave = () => {
            const formattedValue = formatValueForSubmission(editValue);
            handleSaveEdit(jobId, {
                field: editingCell.field,
                value: formattedValue
            });
            setEditingCell(null);
            setEditValue('');
            setCursorPosition(null);
        };

        const handleCancel = () => {
            handleCancelEdit();
            setCursorPosition(null);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSave();
            } else if (e.key === 'Escape') {
                handleCancel();
            }
        };

        if (!isEditing) {
            return (
                <TableCell
                    onClick={() => handleStartEdit(jobId, field, value)}
                    sx={{
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        },
                        height: '52px',
                        verticalAlign: 'middle',
                    }}
                >
                    {type === 'date' ? (
                        value ? new Date(value).toLocaleDateString() : '-'
                    ) : value}
                </TableCell>
            );
        }

        return (
            <TableCell
                padding="none"
                sx={{
                    height: '52px',
                    verticalAlign: 'middle',
                }}
            >
                <ClickAwayListener onClickAway={handleCancel}>
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            p: 1,
                            width: '100%',
                            height: '100%',
                            alignItems: 'center',
                        }}
                    >
                        {type === 'date' ? (
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    value={editValue ? new Date(editValue) : null}
                                    onChange={(newValue) => setEditValue(newValue)}
                                    slotProps={{
                                        textField: {
                                            size: "small",
                                            sx: { width: '150px' },
                                            onKeyDown: handleKeyDown
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        ) : (
                            <TextField
                                inputRef={textFieldRef}
                                value={editValue}
                                onChange={handleTextChange}
                                onKeyDown={handleKeyDown}
                                size="small"
                                autoFocus
                                sx={{
                                    minWidth: field === 'company_name' ? '150px' : '200px',
                                    flexGrow: 1,
                                }}
                            />
                        )}
                        <Stack direction="row" spacing={1}>
                            <IconButton
                                size="small"
                                onClick={handleSave}
                                color="primary"
                            >
                                <CheckIcon />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={handleCancel}
                                color="error"
                            >
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                    </Stack>
                </ClickAwayListener>
            </TableCell>
        );
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortData = (data) => {
        return [...data].sort((a, b) => {
            if (!a[orderBy] && !b[orderBy]) return 0;
            if (!a[orderBy]) return 1;
            if (!b[orderBy]) return -1;

            let comparison = 0;
            if (orderBy === 'date_applied' || orderBy === 'next_milestone_date') {
                // Handle date comparison
                const dateA = a[orderBy] ? new Date(a[orderBy]).getTime() : 0;
                const dateB = b[orderBy] ? new Date(b[orderBy]).getTime() : 0;
                comparison = dateA - dateB;
            } else {
                // Handle string comparison
                comparison = a[orderBy].toString().localeCompare(b[orderBy].toString());
            }

            return order === 'asc' ? comparison : -comparison;
        });
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.role_title.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'All Statuses' || job.application_status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const sortedJobs = sortData(filteredJobs);

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
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 500 }}>
                Job Applications
            </Typography>

            <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                    <TextField
                        placeholder="Search jobs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="small"
                        sx={{ minWidth: 300 }}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="All Statuses">All Statuses</MenuItem>
                            <MenuItem value="not_yet_applied">Not Yet Applied</MenuItem>
                            <MenuItem value="applied">Applied</MenuItem>
                            <MenuItem value="screening_call">Screening Call</MenuItem>
                            <MenuItem value="interview">Interview</MenuItem>
                            <MenuItem value="test_task">Test Task</MenuItem>
                            <MenuItem value="offer">Offer</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                            <MenuItem value="no_answer">No Answer</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/jobs/new')}
                >
                    Add New Job
                </Button>
            </Box>

            <Typography
                variant="subtitle1"
                sx={{
                    mb: 3,
                    color: 'text.secondary',
                    fontWeight: 500,
                }}
            >
                Showing {filteredJobs.length} of {jobs.length} jobs
            </Typography>

            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Company</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Date Applied</TableCell>
                                <TableCell>Next Milestone</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedJobs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            {searchQuery ? 'No jobs found matching your search' : 'No jobs found. Add your first job application!'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedJobs.map((job) => (
                                    <TableRow
                                        key={job.id}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                            },
                                        }}
                                    >
                                        <EditableCell
                                            jobId={job.id}
                                            field="company_name"
                                            value={job.company_name}
                                        />
                                        <EditableCell
                                            jobId={job.id}
                                            field="role_title"
                                            value={job.role_title}
                                        />
                                        <StatusCell
                                            jobId={job.id}
                                            value={job.application_status}
                                        />
                                        <EditableCell
                                            jobId={job.id}
                                            field="date_applied"
                                            value={job.date_applied}
                                            type="date"
                                        />
                                        <EditableCell
                                            jobId={job.id}
                                            field="next_milestone_date"
                                            value={job.next_milestone_date}
                                            type="date"
                                        />
                                        <TableCell align="right">
                                            <Tooltip title="Edit All Fields">
                                                <IconButton
                                                    onClick={() => navigate(`/jobs/edit/${job.id}`)}
                                                    size="small"
                                                    sx={{ mr: 1 }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    onClick={() => handleDelete(job.id)}
                                                    size="small"
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}

export default Jobs; 