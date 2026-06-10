#!/usr/bin/env node

const inquirer = require('inquirer');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const open = require('open');
const chalk = require('chalk');
const getPort = require('get-port');

// Mac Terminal theme colors
const colors = {
  primary: chalk.hex('#4ec9b0'),    // teal
  secondary: chalk.hex('#569cd6'),  // blue
  success: chalk.hex('#89d185'),    // green
  warning: chalk.hex('#dcdcaa'),    // yellow
  error: chalk.hex('#f48771'),      // red
  text: chalk.hex('#d4d4d4'),       // light gray
  dim: chalk.hex('#808080'),        // gray
};

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Get package version
const packageJson = require('../package.json');
const version = packageJson.version;

// Package root directory
const packageRoot = path.resolve(__dirname, '..');
const backendDir = path.join(packageRoot, 'backend');

let serverProcess = null;
let port = null; // Will be assigned dynamically
const localIP = getLocalIP();

// Start server with auto port detection
async function startServer() {
  // Find available port
  const preferredPort = process.env.PORT || 3001;
  port = await getPort({ port: preferredPort });
  
  if (port !== preferredPort) {
    console.log(colors.warning('   ⚠️  Port ' + preferredPort + ' in use, using port ' + port + ' instead'));
  }
  
  return new Promise((resolve, reject) => {
    let serverStarted = false;
    let errorOccurred = false;

    serverProcess = spawn('node', [path.join(backendDir, 'dist', 'index.js')], {
      cwd: backendDir,
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'production', PORT: port }
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('━')) {
        console.log('   ' + output);
      }
      
      if (output.includes('running on')) {
        serverStarted = true;
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const error = data.toString().trim();
      if (error) {
        console.error('   ' + error);
      }
      
      if (error.includes('EADDRINUSE')) {
        errorOccurred = true;
      }
    });

    serverProcess.on('error', (err) => {
      errorOccurred = true;
      reject(err);
    });

    serverProcess.on('exit', (code) => {
      if (code !== 0 && code !== null && !serverStarted) {
        errorOccurred = true;
      }
    });

    setTimeout(() => {
      if (errorOccurred) {
        serverProcess = null;
        reject(new Error('Failed to start server'));
      } else {
        resolve();
      }
    }, 3000);
  });
}

// Stop server
function stopServer() {
  return new Promise((resolve) => {
    if (serverProcess) {
      let resolved = false;
      
      serverProcess.once('exit', () => {
        if (!resolved) {
          resolved = true;
          serverProcess = null;
          resolve();
        }
      });
      
      serverProcess.kill('SIGTERM');
      
      // Force kill after 3 seconds if not stopped
      setTimeout(() => {
        if (!resolved && serverProcess) {
          serverProcess.kill('SIGKILL');
          serverProcess = null;
          resolved = true;
          resolve();
        }
      }, 3000);
    } else {
      resolve();
    }
  });
}

// Show banner and menu
async function showMenu() {
  console.clear();
  console.log('\n' + colors.primary('='.repeat(60)));
  console.log(colors.primary('  zxwdb') + colors.text(' - Visual Database Designer ') + colors.dim('(v' + version + ')'));
  console.log(colors.text('  🚀 Server: ') + colors.secondary('http://localhost:' + port));
  console.log(colors.text('  🌐 Network: ') + colors.secondary('http://' + localIP + ':' + port));
  console.log(colors.primary('='.repeat(60)));

  const choices = [
    { name: colors.text('☆ Open in Browser'), value: 'browser' },
    { name: colors.text('☆ View Server Info'), value: 'info' },
    { name: colors.text('☆ View Documentation'), value: 'docs' },
    { name: colors.text('☆ Restart Server'), value: 'restart' },
    { name: colors.text('☆ Stop & Exit'), value: 'exit' }
  ];

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: colors.text('Choose an option:'),
      choices: choices,
      pageSize: 10
    }
  ]);

  return answer.action;
}

// Handle menu actions
async function handleAction(action) {
  switch (action) {
    case 'browser':
      console.log('\n' + colors.secondary('🌐 Opening browser...\n'));
      await open('http://localhost:' + port);
      break;

    case 'info':
      console.log('\n' + colors.dim('─'.repeat(60)));
      console.log(colors.primary('📊 Server Information:'));
      console.log(colors.text('   Version: ') + colors.warning(version));
      console.log(colors.text('   Port: ') + colors.warning(port));
      console.log(colors.text('   Local URL: ') + colors.secondary('http://localhost:' + port));
      console.log(colors.text('   Network URL: ') + colors.secondary('http://' + localIP + ':' + port));
      console.log(colors.text('   Backend: ') + colors.dim(backendDir));
      console.log(colors.text('   Process ID: ') + colors.dim(serverProcess ? serverProcess.pid : 'N/A'));
      console.log(colors.dim('─'.repeat(60)) + '\n');
      
      await inquirer.prompt([{ type: 'input', name: 'continue', message: colors.dim('Press Enter to continue...') }]);
      break;

    case 'docs':
      console.log('\n' + colors.primary('='.repeat(60)));
      console.log(colors.primary('📚 ZXWDB DOCUMENTATION'));
      console.log(colors.primary('='.repeat(60)));
      
      console.log('\n' + colors.secondary('🚀 GETTING STARTED:'));
      console.log(colors.dim('───────────────────────────────────────────────────────────'));
      console.log(colors.text('  1. Connect to Database'));
      console.log(colors.dim('     Click "Connect to Database" and enter MySQL credentials\n'));
      console.log(colors.text('  2. Select Database'));
      console.log(colors.dim('     Choose existing database or create new one\n'));
      console.log(colors.text('  3. Import or Design'));
      console.log(colors.dim('     Import existing schema OR design new tables visually\n'));
      
      console.log('\n' + colors.secondary('📐 VISUAL DESIGNER:'));
      console.log(colors.dim('───────────────────────────────────────────────────────────'));
      console.log(colors.text('  • Add Tables: ') + colors.warning('Click "+ Add Table" or press Cmd+N'));
      console.log(colors.text('  • Edit Tables: ') + colors.warning('Click table → "Edit Structure"'));
      console.log(colors.text('  • Create Relationships: ') + colors.warning('Drag from column to column'));
      console.log(colors.text('  • Delete Items: ') + colors.warning('Select table and press Delete\n'));
      
      console.log('\n' + colors.secondary('💾 DATA MANAGEMENT:'));
      console.log(colors.dim('───────────────────────────────────────────────────────────'));
      console.log(colors.text('  • Browse Data: ') + colors.warning('Click "Browse Data" (Cmd+B)'));
      console.log(colors.text('  • Insert Rows: ') + colors.warning('Click "Add Row" button'));
      console.log(colors.text('  • Edit Data: ') + colors.warning('Click Edit icon, modify, then Save'));
      console.log(colors.text('  • View Related: ') + colors.warning('Click "Related" to see FK data\n'));
      
      console.log('\n' + colors.secondary('🔍 QUERY & TEST:'));
      console.log(colors.dim('───────────────────────────────────────────────────────────'));
      console.log(colors.text('  • Run Queries: ') + colors.warning('Browse Data → Query tab'));
      console.log(colors.text('  • Quick Templates: ') + colors.warning('Click suggested queries'));
      console.log(colors.text('  • Verify FK: ') + colors.warning('Use "Verify FK" templates'));
      console.log(colors.text('  • Preview SQL: ') + colors.warning('Press Cmd+P\n'));
      
      console.log('\n' + colors.secondary('⌨️  KEYBOARD SHORTCUTS:'));
      console.log(colors.dim('───────────────────────────────────────────────────────────'));
      console.log(colors.text('  • ') + colors.warning('Hold Cmd/Ctrl') + colors.dim('     - Show all shortcuts overlay'));
      console.log(colors.text('  • ') + colors.warning('Cmd+Z / Cmd+⇧+Z') + colors.dim('   - Undo / Redo'));
      console.log(colors.text('  • ') + colors.warning('Cmd+B') + colors.dim('             - Browse Data'));
      console.log(colors.text('  • ') + colors.warning('Cmd+N') + colors.dim('             - New Table'));
      console.log(colors.text('  • ') + colors.warning('Cmd+P') + colors.dim('             - Preview SQL'));
      console.log(colors.text('  • ') + colors.warning('Cmd+K') + colors.dim('             - Quick Search'));
      console.log(colors.text('  • ') + colors.warning('ESC') + colors.dim('               - Close/Cancel'));
      console.log(colors.text('  • ') + colors.warning('F') + colors.dim('                 - Fit View'));
      console.log(colors.text('  • ') + colors.warning('Delete') + colors.dim('            - Delete Selected\n'));
      
      console.log('\n' + colors.secondary('✨ FEATURES:'));
      console.log(colors.dim('───────────────────────────────────────────────────────────'));
      console.log(colors.success('  ✓ Auto-save to database (like MySQL Workbench)'));
      console.log(colors.success('  ✓ Auto-detect FK relationships'));
      console.log(colors.success('  ✓ Relationship cardinality badges (N:1, 1:N)'));
      console.log(colors.success('  ✓ Undo/Redo support for all operations'));
      console.log(colors.success('  ✓ Network accessible from any device'));
      console.log(colors.success('  ✓ Beautiful Mac Terminal theme\n'));
      
      console.log(colors.primary('='.repeat(60)));
      console.log(colors.warning('💡 TIP: ') + colors.dim('Click "Docs" button in navbar for interactive guide'));
      console.log(colors.primary('='.repeat(60)) + '\n');
      
      await inquirer.prompt([{ type: 'input', name: 'continue', message: colors.dim('Press Enter to continue...') }]);
      break;

    case 'restart':
      console.log('\n' + colors.warning('🔄 Restarting server...\n'));
      await stopServer();
      console.log(colors.dim('   Waiting for port to be free...\n'));
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        await startServer();
        console.log('\n' + colors.success('✅ Server restarted!\n'));
      } catch (err) {
        console.error('\n' + colors.error('❌ Failed to restart: ') + err.message);
        console.log(colors.warning('💡 Try: ') + colors.dim('lsof -ti:' + port + ' | xargs kill -9\n'));
        await inquirer.prompt([{ type: 'input', name: 'continue', message: colors.dim('Press Enter to exit...') }]);
        process.exit(1);
      }
      
      break;

    case 'exit':
      console.log('\n' + colors.warning('🛑 Stopping server...'));
      await stopServer();
      console.log(colors.success('👋 Goodbye!\n'));
      process.exit(0);
      break;
  }
}

// Main function
async function main() {
  console.clear();
  console.log('\n' + colors.primary('='.repeat(60)));
  console.log(colors.primary('  zxwdb') + colors.text(' - Visual Database Designer ') + colors.dim('(v' + version + ')'));
  console.log(colors.primary('='.repeat(60)));
  console.log('\n' + colors.secondary('🚀 Starting server...\n'));

  try {
    await startServer();
    console.log('\n' + colors.success('✅ Server is running!'));
    console.log(colors.text('📍 Local:   ') + colors.secondary('http://localhost:' + port));
    console.log(colors.text('🌐 Network: ') + colors.secondary('http://' + localIP + ':' + port));
    console.log('\n' + colors.warning('💡 Tip: ') + colors.dim('Open in browser to start designing!\n'));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Menu loop
    while (true) {
      const action = await showMenu();
      if (action === 'exit') {
        console.log('\n' + colors.warning('🛑 Stopping server...'));
        await stopServer();
        console.log(colors.success('👋 Goodbye!\n'));
        process.exit(0);
      }
      await handleAction(action);
    }
  } catch (err) {
    console.error('\n' + colors.error('❌ Failed to start server: ') + err.message);
    console.log('\n' + colors.warning('💡 Troubleshooting:'));
    console.log(colors.text('   • Check if port ') + colors.warning(port) + colors.text(' is already in use'));
    console.log(colors.text('   • Run: ') + colors.dim('lsof -ti:' + port + ' | xargs kill -9'));
    console.log(colors.text('   • Or set a different port: ') + colors.dim('export PORT=3002\n'));
    process.exit(1);
  }
}

// Handle Ctrl+C
process.on('SIGINT', async () => {
  console.log('\n\n' + colors.warning('🛑 Stopping server...'));
  await stopServer();
  console.log(colors.success('👋 Goodbye!\n'));
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await stopServer();
  process.exit(0);
});

// Start
main().catch((err) => {
  console.error(colors.error('❌ Error: ') + err.message);
  stopServer();
  process.exit(1);
});
