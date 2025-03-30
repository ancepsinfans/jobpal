import React from "react"
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Typography,
} from "@mui/material"
import {
  Application,
  ApplicationCreate,
} from "../services/applicationService"

interface ApplicationFormProps {
  application?: Application
  onSubmit: (data: ApplicationCreate) => void
  onCancel: () => void
}

const statusOptions = [
  "draft",
  "applied",
  "interviewing",
  "offered",
  "rejected",
  "withdrawn",
]

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  application,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = React.useState<ApplicationCreate>(
    application || {
      company_name: "",
      position_title: "",
      status: "draft",
    }
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 3 }}
    >
      <Typography
        variant="h6"
        gutterBottom
      >
        {application ? "Edit Application" : "New Application"}
      </Typography>
      <Grid
        container
        spacing={2}
      >
        <Grid
          item
          xs={12}
          sm={6}
        >
          <TextField
            required
            fullWidth
            label="Company Name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
        >
          <TextField
            required
            fullWidth
            label="Position Title"
            name="position_title"
            value={formData.position_title}
            onChange={handleChange}
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
        >
          <TextField
            fullWidth
            label="Job Description"
            name="job_description"
            multiline
            rows={4}
            value={formData.job_description || ""}
            onChange={handleChange}
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
        >
          <TextField
            fullWidth
            label="Application URL"
            name="application_url"
            value={formData.application_url || ""}
            onChange={handleChange}
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
        >
          <TextField
            select
            fullWidth
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            {statusOptions.map((option) => (
              <MenuItem
                key={option}
                value={option}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
        >
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location || ""}
            onChange={handleChange}
          />
        </Grid>
        <Grid
          item
          xs={12}
        >
          <TextField
            fullWidth
            label="Notes"
            name="notes"
            multiline
            rows={4}
            value={formData.notes || ""}
            onChange={handleChange}
          />
        </Grid>
        <Grid
          item
          xs={12}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
            >
              {application ? "Update" : "Create"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
