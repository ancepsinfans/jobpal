import React, { useState } from "react"
import { Box, Button, Dialog } from "@mui/material"
import { ApplicationList } from "../components/ApplicationList"
import { ApplicationForm } from "../components/ApplicationForm"
import {
  Application,
  ApplicationCreate,
} from "../services/applicationService"
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { applicationService } from "../services/applicationService"

export const ApplicationsPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState<
    Application | undefined
  >()
  const queryClient = useQueryClient()

  // Fetch applications
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: () => applicationService.getApplications(),
  })

  // Create application mutation
  const createMutation = useMutation({
    mutationFn: applicationService.createApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      setIsFormOpen(false)
      setSelectedApplication(undefined)
    },
  })

  // Update application mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: ApplicationCreate
    }) => applicationService.updateApplication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
      setIsFormOpen(false)
      setSelectedApplication(undefined)
    },
  })

  // Delete application mutation
  const deleteMutation = useMutation({
    mutationFn: applicationService.deleteApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] })
    },
  })

  const handleCreate = () => {
    setSelectedApplication(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (application: Application) => {
    setSelectedApplication(application)
    setIsFormOpen(true)
  }

  const handleDelete = (id: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this application?"
      )
    ) {
      deleteMutation.mutate(id)
    }
  }

  const handleSubmit = (data: ApplicationCreate) => {
    if (selectedApplication) {
      updateMutation.mutate({ id: selectedApplication.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <h1>Applications</h1>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
        >
          New Application
        </Button>
      </Box>

      <ApplicationList
        applications={applications}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <ApplicationForm
          application={selectedApplication}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </Dialog>
    </Box>
  )
}
