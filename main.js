const path = require('path');
const os = require('os');
const fs = require('fs');
const archiver = require('archiver');

const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const log = require('electron-log');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');


const imageminMozjpeg = require('imagemin-mozjpeg');
const slash = require('slash');
const { createGzip } = require('zlib');

let mainWindow;

process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'production';
const isMac = process.platform === 'darwin';
const isAnImg = (name) => /.jpg$|.png$/.test(name);

function createMainWindow(){
    mainWindow = new BrowserWindow({
        title: 'DCMPackage',
        width: 600,
        height: 500,
        icon: `${__dirname}/assets/icons/icon.png`,
        resizable: false,
        backgroundColor: 'white',
        webPreferences: {
            nodeIntegration: true
        }
    })
    
    mainWindow.loadFile('./src/index.html');
}

app.on('ready', ()=> {
    createMainWindow()
    
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
    
    mainWindow.on('closed', () => mainWindow = null);
    
});


const menu = [
    {
        role: 'fileMenu'
    },
    ...(isDev ? [
        {
            label: 'Developer',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { type: 'separator' },
                { role: 'toggledevtools' },
            ]
        }
    ] : [])
]

ipcMain.on('package:create', (e, options) => {
    options.fileArr.forEach(el => {
        const dir = slash(el)
        const base = path.basename(dir);
        createZip(dir, base)
    })
    mainWindow.webContents.send('package:done')
})

ipcMain.on('image:compress', (e, options) => {
    options.fileArr.forEach(el => {
        const filePath = slash(el);
        const dir = slash(path.dirname(el));
        shrinkImage(filePath, dir)
    })
    mainWindow.webContents.send('image:done')  
})

async function shrinkImage(img, dest){
    try{
        const files = await imagemin([img], {
            destination: dest,
            plugins: [
                imageminMozjpeg({ quality: 60 }),
                imageminPngquant({
                    quality: [.6, .6]
                })
            ]
        })

        log.info(files);
    } catch(err){
        log.error(err);
    }
}

function createZip(dir, name){
    const root = path.normalize(`${dir}..`);
    const zipName = path.join(root, `${name}.zip`)
    const output = fs.createWriteStream(zipName);
    const archive = archiver('zip', {
        zlib: { level: 9 }
      });

    output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
    });
       
    output.on('end', function() {
    console.log('Data has been drained');
    });

    archive.on('error', err => {
        throw err;
    });
    
    archive.pipe(output);

    archive.glob('**/*', {
        cwd: dir,
        ignore: ['index.fla']
    }, {})

    archive.finalize();
}