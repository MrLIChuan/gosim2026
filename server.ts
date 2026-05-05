import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import multer from 'multer';
import { AnalysisState, Jurisdiction } from './src/types';

// Simple in-memory DB for demo
const matters = [
  {
    id: 'm1',
    title: 'EP 5G HARQ Scheduling Offset Case',
    applicationNumber: 'EP24182456.7',
    applicant: 'SinoTel Communications Ltd.',
    clientName: 'SinoTel',
    jurisdiction: 'EPO',
    technologyArea: 'Telecom / 5G',
    deadline: '2026-09-15',
    status: 'ACTIVE',
    attorneyId: 'default',
    createdAt: new Date().toISOString()
  }
];

const tasks: Record<string, any> = {};
const providerSettings = {
  kimi: { configured: false, mode: 'mock' },
  minimax: { configured: false, mode: 'mock' },
  epoOps: { configured: false, mode: 'mock' }
};

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // --- API Routes ---

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      version: '0.1.0',
      demo_mode: true,
      providers: {
        kimi: providerSettings.kimi.mode,
        minimax: providerSettings.minimax.mode,
        epoOps: providerSettings.epoOps.mode,
        voice: 'mock'
      }
    });
  });

  app.get('/api/matters', (req, res) => {
    res.json(matters);
  });

  app.get('/api/matters/:id', (req, res) => {
    const matter = matters.find(m => m.id === req.params.id);
    if (!matter) return res.status(404).json({ error: 'Matter not found' });
    res.json(matter);
  });

  // Mock Analysis Pipeline
  app.post('/api/matters/:id/analyze', (req, res) => {
    const taskId = `task_${Math.random().toString(36).substr(2, 9)}`;
    tasks[taskId] = {
      taskId,
      state: AnalysisState.STARTED,
      percent: 0,
      step: 'Initializing pipeline...',
      result: null
    };

    // Simulate async progress
    const steps = [
      { p: 10, s: 'Extracting PDF text...' },
      { p: 30, s: 'Parsing Office Action...' },
      { p: 50, s: 'Splitting claims into features...' },
      { p: 70, s: 'Checking translation precision...' },
      { p: 90, s: 'Drafting response...' },
      { p: 100, s: 'Analysis Complete' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        tasks[taskId].percent = steps[currentStep].p;
        tasks[taskId].step = steps[currentStep].s;
        if (steps[currentStep].p === 100) {
          tasks[taskId].state = AnalysisState.SUCCESS;
          clearInterval(interval);
        }
        currentStep++;
      }
    }, 1500);

    res.json({ taskId });
  });

  app.get('/api/tasks/:id', (req, res) => {
    const task = tasks[req.params.id];
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  });

  // Provider Settings
  app.get('/api/settings/providers', (req, res) => {
    res.json(providerSettings);
  });

  app.post('/api/settings/providers/kimi', (req, res) => {
    const { apiKey } = req.body;
    providerSettings.kimi.configured = !!apiKey;
    providerSettings.kimi.mode = apiKey ? 'configured' : 'mock';
    res.json({ status: 'ok' });
  });

  // --- Vite Middleware ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PatentFlow OA running on http://localhost:${PORT}`);
  });
}

startServer();
