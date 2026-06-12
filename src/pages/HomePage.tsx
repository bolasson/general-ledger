import { Box, Container, Typography } from '@mui/material';
import { logger } from '@/logger';

export function HomePage() {
  logger.debug({ module: 'HomePage', action: 'render' }, 'Rendering');

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 8 }}>
        <Typography variant="h2" gutterBottom>
          Welcome
        </Typography>
        <Typography variant="body1">
          This is your new website. Edit <code>src/pages/HomePage.tsx</code> to change this page,
          or ask for a new page, component, or feature and the right skill will handle it.
        </Typography>
      </Box>
    </Container>
  );
}
