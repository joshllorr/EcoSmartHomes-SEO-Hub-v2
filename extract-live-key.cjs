const exec = require('child_process').execSync;
try {
    const pm2List = JSON.parse(exec('pm2 jlist').toString());
    let keyFound = false;
    for (const app of pm2List) {
        if (app.pm2_env && app.pm2_env.GEMINI_API_KEY) {
            console.log('\n✅ FOUND IN MEMORY (' + app.name + '): ' + app.pm2_env.GEMINI_API_KEY);
            keyFound = true;
        }
    }
    if (keyFound === false) {
        const envs = exec('ps e -u joehr4838').toString();
        const match = envs.match(/GEMINI_API_KEY=([^\s]+)/) || envs.match(/API_KEY=([^\s]+)/);
        if (match) {
            console.log('\n✅ FOUND IN SYSTEM ENVIRONMENT: ' + match[1]);
        } else {
            console.log('\n❌ No keys found in active process streams.');
        }
    }
} catch (err) {
    console.error('Extraction error:', err);
}
