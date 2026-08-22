import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

// Force absolute injection of the local .env configuration module variables into runtime process memory
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

import { executeProgrammaticMunsterCampaign } from './src/engines/marlCoordinator';

executeProgrammaticMunsterCampaign({ limit: 10 })
  .then((res) => {
    console.log(`✅ Sandbox campaign finished successfully. Generated ${res.generatedCount} pages.`);
  })
  .catch((err) => {
    console.error('❌ Sandbox campaign execution error:', err);
  });
