import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5173;

app.use(express.json());

// Serve static asset folders cleanly from your production asset structure
app.use('/assets', express.static(path.join(process.cwd(), 'dist', 'assets')));

// API Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: "healthy", timestamp: Date.now(), engine: "Gemini 3.7 Flash" });
});

// Primary campaign trigger function
async function triggerMarlCampaign() {
    console.log("🚀 Initializing standalone backend campaign sequence via Gemini 3.7 Engine...");
    try {
        // Target our newly isolated backend compiled file
        const coordinatorPath = path.join(process.cwd(), 'dist', 'marlCoordinator.cjs');
        
        if (!fs.existsSync(coordinatorPath)) {
            console.error("❌ Isolated backend compiled coordinator file could not be located.");
            return;
        }

        const coordinator = await import(coordinatorPath);
        if (coordinator && coordinator.executeProgrammaticMunsterCampaign) {
            await coordinator.executeProgrammaticMunsterCampaign();
            console.log("✅ Campaign batch pass completed successfully.");
        } else {
            console.error("❌ executeProgrammaticMunsterCampaign function not found inside the module.");
        }
    } catch (err) {
        console.error("❌ Critical runtime failure in campaign workflow thread:", err);
    }
}

// Trigger route to manually execute campaign generation maps via HTTP calls
app.post('/api/campaign/trigger', async (req, res) => {
    await triggerMarlCampaign();
    res.json({ success: true, message: "Campaign loop triggered." });
});

// Modern catch-all route parameters rule for single page web views
app.get('/*splat', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

// CHECK FOR TERMINAL FLAGS: If --trigger-campaign is passed, run it directly without starting the web listener
if (process.argv.includes('--trigger-campaign')) {
    console.log("⚙️ Terminal override detected. Running direct campaign sweep...");
    triggerMarlCampaign().then(() => process.exit(0)).catch(() => process.exit(1));
} else {
    // Standard PM2 Web Dashboard Server Boot
    app.listen(PORT, async () => {
        console.log(`\n==========================================================`);
        console.log(`🚀 EcoSmartHomes Production Server running on port ${PORT}`);
        console.log(`==========================================================\n`);
        
        // Auto-trigger an initial campaign pass on boot to verify health
        await triggerMarlCampaign();
    });
}
