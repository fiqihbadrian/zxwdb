# AUTO-UPDATE FEATURE

## Overview
Tambahkan fitur auto-update checker ke CLI menu zxwdb yang akan:
- Check versi terbaru dari npm
- Tampilkan notifikasi "🆕 New Version Available!"
- Tambahkan menu option untuk update dengan warna mencolok
- Stop server otomatis
- Paste command ke terminal user (tanpa auto-execute)

---

## Implementation Steps

### 1. Install Dependencies
```bash
npm install latest-version
```

### 2. Add Version Checker Function (bin/zxwdb.js)

```javascript
const latestVersion = require('latest-version');

// Check for updates
async function checkForUpdates() {
  try {
    const latest = await latestVersion('zxwdb');
    const current = version; // from package.json
    
    if (latest !== current) {
      return { hasUpdate: true, latest, current };
    }
    return { hasUpdate: false };
  } catch (err) {
    return { hasUpdate: false };
  }
}
```

### 3. Update Menu Display (showMenu function)

```javascript
async function showMenu() {
  console.clear();
  
  // Check for updates
  const updateInfo = await checkForUpdates();
  
  console.log('\n' + colors.primary('='.repeat(60)));
  console.log(colors.primary('  zxwdb') + colors.text(' - Visual Database Designer ') + colors.dim('(v' + version + ')'));
  console.log(colors.text('  🚀 Server: ') + colors.secondary('http://localhost:' + port));
  console.log(colors.text('  🌐 Network: ') + colors.secondary('http://' + localIP + ':' + port));
  
  // Show update notification
  if (updateInfo.hasUpdate) {
    console.log(colors.warning('\n  🆕 NEW VERSION AVAILABLE: v' + updateInfo.latest + ' (current: v' + updateInfo.current + ')'));
  }
  
  console.log(colors.primary('='.repeat(60)));

  const choices = [
    { name: colors.text('☆ Open in Browser'), value: 'browser' },
    { name: colors.text('☆ View Server Info'), value: 'info' },
    { name: colors.text('☆ View Documentation'), value: 'docs' },
    { name: colors.text('☆ Restart Server'), value: 'restart' },
    { name: colors.text('☆ Stop & Exit'), value: 'exit' }
  ];
  
  // Add update option if available
  if (updateInfo.hasUpdate) {
    choices.splice(4, 0, { 
      name: colors.error('⚡ UPDATE TO v' + updateInfo.latest + ' (RECOMMENDED)'), 
      value: 'update' 
    });
  }

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
```

### 4. Handle Update Action (handleAction function)

```javascript
case 'update':
  console.log('\n' + colors.warning('🔄 Preparing to update...\n'));
  console.log(colors.text('Stopping server...'));
  await stopServer();
  
  console.log('\n' + colors.success('✅ Server stopped!\n'));
  console.log(colors.primary('='.repeat(60)));
  console.log(colors.warning('📦 To update zxwdb, copy and run this command:\n'));
  console.log(colors.secondary('   npm install -g zxwdb@latest\n'));
  console.log(colors.dim('(Command not auto-executed for safety)'));
  console.log(colors.primary('='.repeat(60)) + '\n');
  
  // Exit after showing command
  process.exit(0);
  break;
```

### 5. Add to package.json dependencies

```json
{
  "dependencies": {
    "chalk": "^4.1.2",
    "inquirer": "^8.2.5",
    "open": "^8.4.0",
    "latest-version": "^7.0.0"
  }
}
```

---

## Testing

### Test Update Checker
1. Publish v1.0.0 to npm
2. Locally change version to v0.9.0 in package.json
3. Run `zxwdb`
4. Should show "New Version Available" notification
5. Menu should have "UPDATE TO v1.0.0" option with red color

### Test Update Flow
1. Select "UPDATE TO v1.0.0" option
2. Server should stop
3. Terminal should show update command
4. User copies command and runs manually
5. zxwdb updated to latest version

---

## User Experience

**Before Update:**
```
============================================================
  zxwdb - Visual Database Designer (v0.9.0)
  🚀 Server: http://localhost:3001
  🌐 Network: http://192.168.101.5:3001

  🆕 NEW VERSION AVAILABLE: v1.0.0 (current: v0.9.0)
============================================================

? Choose an option: (Use arrow keys)
  ☆ Open in Browser
  ☆ View Server Info
  ☆ View Documentation
  ☆ Restart Server
❯ ⚡ UPDATE TO v1.0.0 (RECOMMENDED)    <- RED COLOR!
  ☆ Stop & Exit
```

**After Selecting Update:**
```
🔄 Preparing to update...

Stopping server...

✅ Server stopped!

============================================================
📦 To update zxwdb, copy and run this command:

   npm install -g zxwdb@latest

(Command not auto-executed for safety)
============================================================
```

---

## Benefits

✅ Users always know when updates available
✅ Easy one-click update process
✅ Safe (doesn't auto-execute, user has control)
✅ Professional UX (like VS Code, npm, etc.)
✅ Stops server cleanly before update

---

## Notes

- Update check happens every time menu is shown
- Uses npm registry to check latest version
- No internet = no error, just skips update check
- Update command shown but not executed (safety)
- User must manually run the command
- After update, user runs `zxwdb` again with new version
