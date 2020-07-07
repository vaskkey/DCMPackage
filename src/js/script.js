const path = require('path');
const os = require('os');

const { ipcRenderer } = require('electron')

const form = document.getElementById('folder-form')
const compress = document.getElementById('compress')
const slider = document.getElementById('slider')
const img = document.getElementById('img')

const isAnImg = (name) => /.jpg$|.png$/.test(name);

const inputFolder = document.getElementById('input-folder');



form.addEventListener('submit', e =>{
    e.preventDefault()
    let fileArr = []; 
    for(let file of inputFolder.files){
        if(file.name === 'index.html'){
            const filePath = file.path.replace('index.html', '');
            fileArr.push(filePath);
        }
    }
    ipcRenderer.send('package:create', {
        fileArr
    })
})

compress.addEventListener('click', e => {
    e.preventDefault();
    let fileArr = []; 
    for(let file of inputFolder.files){
        if(isAnImg(file.name)){
            const filePath = file.path;
            fileArr.push(filePath);
        }
    }
    ipcRenderer.send('image:compress', {
        fileArr
    })
})

ipcRenderer.on('image:done', () => {
    M.toast({
        html: `All Images Compressed`
    })
})

ipcRenderer.on('package:done', () => {
    M.toast({
        html: 'All Zips Created'
    })
})