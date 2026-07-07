const { spawn } = require('child_process');

console.log('Testing git spawn...');
const child = spawn('git', ['--version']);

child.stdout.on('data', (data) => console.log(`stdout: ${data}`));
child.stderr.on('data', (data) => console.error(`stderr: ${data}`));

child.on('close', (code) => console.log(`child process exited with code ${code}`));
child.on('error', (err) => {
    console.error(`Failed to start subprocess: ${err}`);
    console.error(`Error details:`, err);
});
