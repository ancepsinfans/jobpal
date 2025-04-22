# Jobpal

## First Stage Requirements

- front end on port 5137
  - uses react + js (no typescript)
- back end
  - on port 7315
  - uses flask
- postgres database
- nice, pleasant web interface for managing applications
- when adding a job i need the following fields:
  1.  link to vacancy
  2.  text area box for text of the vacancy (nice to have: automatic text fetching via link)
  3.  status
      1. not yet applied
      2. applied
      3. rejected
      4. test task
      5. screening call
      6. interview
      7. offer
      8. (nice to have: ability to add status, maybe in an admin panel)
  4.  date applied
  5.  a second date field
      1. must have: ability to set up telegram notification (can supply token) when the date is reached in order not to forget about an application
      2. this date will function also as a "Next milestone" date (if an interview is scheduled) or if a rejection is given, it's the rejection date
  6.  Salary offered
      1. don't know the best way to do this, maybe working with a minimum salary since most vacancies have ranges (and rather large ranges)
  7.  Source of vacancy (indeed, linkedin, etc)
  8.  Resume used (must have: file upload OR link to already uploaded file)
  9.  Cover letter used (must have: file upload)
  10. Company name
  11. Role title
  12. <if there are any other fields that might be necessary, please let me know so I can review and approve/reject the suggestion>
- a page that allows me to browse all jobs added with filters for status, date(s), salary, role title
- csv export of database

# Second Stage Requirements

- integration with ollama (local) to generate cover letters
- more to come
