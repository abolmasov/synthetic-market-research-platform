import { Box, Card, CardContent, Container, Typography } from '@mui/material';

export default function PrivacyPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>Privacy Policy</Typography>
          <Typography variant="caption" color="text.secondary" gutterBottom component="p">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>1. Information We Collect</Typography>
            <Typography variant="body2" paragraph>
              We collect information you provide directly, including: persona definitions, segment configurations, hypothesis statements, and document content uploaded for RAG processing. We also collect usage data such as simulation execution logs.
            </Typography>

            <Typography variant="h6" gutterBottom>2. How We Use Your Information</Typography>
            <Typography variant="body2" paragraph>
              Your data is used to: (a) run AI-powered market research simulations; (b) maintain and improve the Platform; (c) generate embeddings for semantic search (RAG). We do not use your data to train AI models.
            </Typography>

            <Typography variant="h6" gutterBottom>3. Third-Party Services</Typography>
            <Typography variant="body2" paragraph>
              The Platform uses Google Cloud Vertex AI for large language model inference and text embedding generation. Data sent to these services is processed according to Google Cloud's terms of service and data processing agreements.
            </Typography>

            <Typography variant="h6" gutterBottom>4. Data Storage</Typography>
            <Typography variant="body2" paragraph>
              Your data is stored in PostgreSQL databases hosted on Google Cloud SQL. Document embeddings are stored using the pgvector extension. All data is encrypted at rest and in transit.
            </Typography>

            <Typography variant="h6" gutterBottom>5. Data Retention</Typography>
            <Typography variant="body2" paragraph>
              Data is retained for as long as your account is active. You may delete your data at any time through the Platform interface (e.g., deleting personas, clearing documents). Simulation history can be reviewed but individual simulations cannot currently be deleted through the UI.
            </Typography>

            <Typography variant="h6" gutterBottom>6. Your Rights</Typography>
            <Typography variant="body2" paragraph>
              You have the right to: access your data, correct inaccuracies, request deletion, and export your data. Contact the Platform administrator to exercise these rights.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
