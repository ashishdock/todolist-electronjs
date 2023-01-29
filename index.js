const electron = require('electron');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  mainWindow.loadURL(`file://${__dirname}/main.html`);
  mainWindow.on('closed', () => app.quit);

  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

function createAddWindow() {
  if (addWindow === undefined || !addWindow.closable) {
    addWindow = new BrowserWindow({
      width: 300,
      height: 200,
      title: 'Add New Todo',
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    });
    addWindow.removeMenu;
    addWindow.loadURL(`file://${__dirname}/add.html`);
    addWindow.on('closed', () => (addWindow = null));
  }
}

ipcMain.on('todo:add', (event, todo) => {
  // eloectronjs receiving data
  mainWindow.webContents.send('todo:add', todo); // electronjs sending data
  console.log(todo);
  addWindow.close(); // this is poor practice. Just doing this, does not clear the memory, so always point the variable carrying this winow to null to clear the memory.
});

const menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Todo',
        click() {
          createAddWindow();
        },
        accelerator:
          process.platform === 'darwin' || process.platform === 'linux'
            ? 'Ctrl+N'
            : 'Ctrl+N',
      },
      {
        label: 'Clear Todos',
        click() {
          mainWindow.webContents.send('todo:clear');
        },
      },
      { label: 'Some task2' },
      {
        label: 'Quit',
        accelerator:
          process.platform === 'darwin' || process.platform === 'linux'
            ? 'Command + Q'
            : 'Alt + F4',
        click() {
          app.quit();
        },
      },
    ],
  },
];

if (process.platform == 'darwin') {
  menuTemplate.unshift({});
}

if (process.env.NODE_ENV !== 'production') {
  menuTemplate.push({
    label: 'DEVELOPER!!!!',
    submenu: [
      {
        label: 'Toggle Developer Tools',
        accelerator:
          process.platform === 'darwin' || process.platform === 'linux'
            ? 'Super+Alt+I'
            : 'Ctrl+Shift+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        role: 'reload',
      },
    ],
  });
}
