import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Group as GroupIcon,
  Flag as FlagIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'completado':
      return 'success';
    case 'en progreso':
      return 'primary';
    case 'pendiente':
      return 'warning';
    case 'atrasado':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case 'completado':
      return '🎉';
    case 'en progreso':
      return '🚀';
    case 'pendiente':
      return '⏳';
    case 'atrasado':
      return '⚠️';
    default:
      return '📋';
  }
};

export default function ProjectCard({ project }) {
  const progress = project.progress || 0;
  const statusColor = getStatusColor(project.status);
  const statusIcon = getStatusIcon(project.status);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AssignmentIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
          <Typography variant="h5" component="h2" gutterBottom>
            {project.title}
          </Typography>
        </Box>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 2, minHeight: '3em' }}
        >
          {project.description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Progreso
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
              },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {progress}% completado
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
          }}
        >
          <Chip
            icon={<span>{statusIcon}</span>}
            label={project.status}
            color={statusColor}
            sx={{
              fontWeight: 'bold',
              '& .MuiChip-icon': {
                fontSize: '1.2rem',
              },
            }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Miembros del equipo">
              <IconButton size="small" color="primary">
                <GroupIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Hitos">
              <IconButton size="small" color="primary">
                <FlagIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Calendario">
              <IconButton size="small" color="primary">
                <CalendarIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}