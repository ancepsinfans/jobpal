import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Box,
} from "@mui/material"
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material"
import { Application } from "../services/applicationService"
import { format } from "date-fns"

interface ApplicationListProps {
  applications: Application[]
  onEdit: (application: Application) => void
  onDelete: (id: number) => void
}

export const ApplicationList: React.FC<ApplicationListProps> = ({
  applications,
  onEdit,
  onDelete,
}) => {
  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
      >
        Applications
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell>{application.company_name}</TableCell>
                <TableCell>{application.position_title}</TableCell>
                <TableCell>{application.status}</TableCell>
                <TableCell>
                  {application.applied_date
                    ? format(
                        new Date(application.applied_date),
                        "MMM d, yyyy"
                      )
                    : "-"}
                </TableCell>
                <TableCell>{application.location || "-"}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(application)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(application.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
