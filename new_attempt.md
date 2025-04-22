# Jobpal

## Completed Requirements

- ✅ front end on port 5137
  - uses react + js (no typescript)
- ✅ back end
  - on port 7315
  - uses flask
- ✅ postgres database
- ✅ nice, pleasant web interface for managing applications
- ✅ when adding a job i need the following fields:
  1.  ✅ link to vacancy
  2.  ✅ text area box for text of the vacancy
  3.  ✅ status
      1. not yet applied
      2. applied
      3. rejected
      4. test task
      5. screening call
      6. interview
      7. offer
  4.  ✅ date applied
  5.  ✅ a second date field
      1. ⏳ must have: ability to set up telegram notification (can supply token) when the date is reached
      2. ✅ this date will function also as a "Next milestone" date (if an interview is scheduled) or if a rejection is given, it's the rejection date
  6.  ✅ Salary offered
      1. ✅ implemented as salary range (min/max)
  7.  ✅ Source of vacancy (indeed, linkedin, etc)
  8.  ✅ Resume used (must have: file upload OR link to already uploaded file)
  9.  ✅ Cover letter used (must have: file upload)
  10. ✅ Company name
  11. ✅ Role title

## Next Steps and Improvements

### High Priority

1. 🔄 Fix CSV export functionality
2. 🔄 Optimize job updates on the jobs/ page
   - Make updates appear instantaneous
   - Handle API failures gracefully with fallback
3. 🔄 Implement Telegram notifications for milestone dates

### User Experience Improvements

4. 🔄 Make the frontend mobile-friendly
   - Responsive design for all components
   - Touch-friendly interactions
   - Improved layout for small screens
5. 🔄 Progressive Web App (PWA) support
   - Enable installation on iOS devices
   - Offline functionality
   - Push notifications

### Feature Enhancements

6. 🔄 Automatic vacancy text fetching
   - Parse vacancy details from provided URL
   - Support major job boards (LinkedIn, Indeed, etc.)
7. 🔄 LLM Integration (Second Stage)
   - Integration with ollama for cover letter generation
   - Potential for job description analysis
   - Automated skill matching

### Legend

- ✅ Completed
- ⏳ In Progress
- 🔄 Planned

# Second Stage Requirements

- ⏳ integration with ollama (local) to generate cover letters
- 🔄 more to come
