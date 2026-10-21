import {
  Box,
  Typography,
  Container,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  Stack,
  Divider,
} from '@mui/material';
import Description from '@mui/icons-material/Description';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Groups from '@mui/icons-material/Groups';
import History from '@mui/icons-material/History';
import Lightbulb from '@mui/icons-material/Lightbulb';
import Psychology from '@mui/icons-material/Psychology';
import Science from '@mui/icons-material/Science';

const guides = [
  {
    icon: <Description fontSize="large" color="primary" />,
    title: '1. Knowledge Base (RAG Documents)',
    description: 'Provide context for the AI agents by uploading market research, competitor reports, or industry trends.',
    details: 'The system uses Retrieval-Augmented Generation (RAG). By uploading documents, you ground the AI in actual data. The system chunks these documents and retrieves relevant context during simulations.',
    example: 'Upload a PDF of your latest user survey or a competitor\'s pricing sheet to give personas realistic context.',
  },
  {
    icon: <Groups fontSize="large" color="primary" />,
    title: '2. Personas & Segments',
    description: 'Define who you are targeting by creating detailed personas and grouping them into market segments.',
    details: 'Personas are AI agents with specific demographics, traits, and goals. They act as synthetic users who will evaluate your hypotheses. Group them into Segments to run targeted simulations.',
    example: 'Create a persona named "Alex, Tech Enthusiast" who values innovation and group Alex into the "Early Adopters" segment.',
  },
  {
    icon: <Science fontSize="large" color="primary" />,
    title: '3. Hypotheses & Studies',
    description: 'Formulate the questions or concepts you want the synthetic market to evaluate.',
    details: 'A Hypothesis is a specific proposition (e.g., a new product feature or pricing change). Studies allow you to group multiple hypotheses together to test complex scenarios.',
    example: 'Hypothesis: "Users will pay $15/month for a premium analytics dashboard."',
  },
  {
    icon: <Psychology fontSize="large" color="primary" />,
    title: '4. Simulations',
    description: 'Run the AI simulation where personas evaluate your hypotheses using System 1 and System 2 thinking.',
    details: 'During a simulation, each persona reviews the hypothesis along with relevant RAG context. They provide an initial gut reaction (System 1) and a reasoned response (System 2), ultimately deciding to "accept", "reject", or "maybe".',
    example: 'Watch as "Alex" rejects the $15/month pricing because the RAG context noted competitor dashboards are only $10/month.',
  },
  {
    icon: <History fontSize="large" color="primary" />,
    title: '5. Analysis & Reports',
    description: 'Review the simulation outcomes, acceptance rates, and detailed persona reasoning.',
    details: 'The platform provides aggregated metrics (acceptance rate, average confidence) and detailed insights into top objections. You can export these reports as PDF or CSV for off-platform analysis.',
    example: 'Discover that the main objection across your "Enterprise" segment is lack of SSO integration, prompting a pivot in your roadmap.',
  },
];

export default function GuidesPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ color: 'primary.main' }}>
          Platform Guide
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Learn how to leverage synthetic personas and RAG-grounded AI analysis to unlock high-fidelity market signals.
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ height: '100%', bgcolor: 'rgba(15,107,91,0.05)', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Lightbulb sx={{ fontSize: 60, color: '#F29F05', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                What is Synthetic Market Research?
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Instead of waiting weeks for surveys, define AI agents (Personas) grounded in your real data (RAG) to instantly validate your ideas (Hypotheses).
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: 4, height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Core Workflow
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={3}>
              {guides.map((guide, index) => (
                <Box key={index}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Box sx={{ mt: 0.5 }}>{guide.icon}</Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>{guide.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{guide.description}</Typography>
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Detailed Concepts & Examples
      </Typography>

      {guides.map((guide, index) => (
        <Accordion key={index} sx={{ mb: 1, '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider', borderRadius: '8px !important' }} elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 3, py: 1 }}>
            <Typography variant="h6" fontWeight={600}>{guide.title}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
            <Typography variant="body1" paragraph>
              {guide.details}
            </Typography>
            <Paper elevation={0} sx={{ bgcolor: 'rgba(242, 159, 5, 0.1)', p: 2, borderLeft: '4px solid', borderColor: 'secondary.main' }}>
              <Typography variant="subtitle2" fontWeight="bold" color="secondary.dark" gutterBottom>
                Example Scenario:
              </Typography>
              <Typography variant="body2" color="text.primary">
                {guide.example}
              </Typography>
            </Paper>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ mt: 8, textAlign: 'center', p: 4, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Ready to run your first simulation?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
          Head over to the Launch Wizard to test an idea right now.
        </Typography>
      </Box>
    </Container>
  );
}
