import { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { format, parseISO, startOfYear } from 'date-fns';
import React from 'react';

const ApplicationCalendar = () => {
    const [calendarData, setCalendarData] = useState([]);
    const startDate = startOfYear(new Date());

    useEffect(() => {
        fetchApplicationData();
    }, []);

    const fetchApplicationData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:7315/api/jobs/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const jobs = await response.json();
                const applicationCounts = jobs.reduce((acc, job) => {
                    if (job.date_applied) {
                        const date = format(parseISO(job.date_applied), 'yyyy-MM-dd');
                        acc[date] = (acc[date] || 0) + 1;
                    }
                    return acc;
                }, {});

                const data = Object.entries(applicationCounts).map(([date, count]) => ({
                    date,
                    count
                }));

                setCalendarData(data);
            }
        } catch (error) {
            console.error('Error fetching application data:', error);
        }
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'MMMM d, yyyy');
    };

    return (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                Application Activity
            </Typography>
            <Box sx={{
                '.react-calendar-heatmap': {
                    width: '100%',
                    height: '160px'
                },
                '.react-calendar-heatmap-month-label': {
                    fontSize: '14px',
                    fill: theme => theme.palette.text.secondary
                },
                '.react-calendar-heatmap-weekday-label': {
                    fontSize: '12px',
                    fill: theme => theme.palette.text.secondary
                },
                '.react-calendar-heatmap-tile': {
                    rx: 2,
                    ry: 2,
                },
                '.color-empty': {
                    fill: '#2D333B'
                },
                '.color-scale-1': {
                    fill: '#0E4429'
                },
                '.color-scale-2': {
                    fill: '#006D32'
                },
                '.color-scale-3': {
                    fill: '#26A641'
                },
                '.color-scale-4': {
                    fill: '#39D353'
                }
            }}>
                <CalendarHeatmap
                    startDate={startDate}
                    endDate={new Date()}
                    values={calendarData}
                    showWeekdayLabels={true}
                    horizontal={true}
                    classForValue={(value) => {
                        if (!value) return 'color-empty';
                        if (value.count <= 1) return 'color-scale-1';
                        if (value.count <= 2) return 'color-scale-2';
                        if (value.count <= 3) return 'color-scale-3';
                        return 'color-scale-4';
                    }}
                    titleForValue={(value) => {
                        if (!value) return 'No applications on this day';
                        return `${value.count} application${value.count !== 1 ? 's' : ''} on ${formatDate(value.date)}`;
                    }}
                    gutterSize={3}
                />
            </Box>
        </Paper>
    );
};

export default ApplicationCalendar; 