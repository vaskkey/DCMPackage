const path = require('path');
const fs = require('fs');

const { ipcRenderer } = require('electron');

const form = document.getElementById('folder-form')
const compress = document.getElementById('compress')
const slider = document.getElementById('slider')

const isAnImg = (name) => /.jpg$|.png$/.test(name);

const inputFolder = document.getElementById('input-folder');



form.addEventListener('submit', e =>{
    e.preventDefault()
    const prevImgArr = Array.from(inputFolder.files).filter(file => file.name.includes('_preview_last_frame'));
    let fileArr = []; 
    for(let file of inputFolder.files){
        if(file.name === 'index.html'){
            const filePath = path.dirname(file.path);
            fileArr.push(filePath);
        }
    }
    ipcRenderer.send('package:create', {
        fileArr
    })
    
    prevImgArr.forEach(file => {
        const dest = path.normalize(`${file.path}/../..`)
        fs.copyFile(file.path, path.join(dest, file.name), () => file);
    })
    
})

compress.addEventListener('click', e => {
    e.preventDefault();
    const level = slider.value;
    let fileArr = []; 
    for(let file of inputFolder.files){
        if(isAnImg(file.name) && !(file.name.includes('_preview'))){
            const filePath = file.path;
            fileArr.push(filePath);
        }
    }
    ipcRenderer.send('image:compress', {
        fileArr, level
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