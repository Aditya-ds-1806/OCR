const { createWorker } = Tesseract;
const image = document.querySelector('#image');
const statusSpan = document.querySelector('#status');
const progressBar = document.querySelector('.progress-bar');
const recognizeBtn = document.querySelector('#recognize');
const jsBtn = document.querySelector('#javascript-pill');
const pyBtn = document.querySelector('#python-pill');
const corsProxy = 'https://cors.bridged.cc/';
const form = document.querySelector('form');

particlesJS.load('particles-js', './particles.json', function () {
    console.log('callback - particles.js config loaded');
});

jsBtn.addEventListener('click', () => toggleTabs(jsBtn, pyBtn));
pyBtn.addEventListener('click', () => toggleTabs(pyBtn, jsBtn));

document.querySelectorAll('input[type=file]').forEach((input) => {
    input.addEventListener('change', function (e) {
        const reader = new FileReader();
        const file = this.files[0];
        const img = new Image();
        disable('#recognize');
        reader.readAsDataURL(file);
        reader.onload = () => img.src = reader.result;
        img.onload = async () => {
            image.src = img.src;
            enable('#recognize');
        }
    });
});

document.querySelector('#url').addEventListener('change', function (e) {
    disable('#recognize');
    const url = corsProxy + this.value;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = async () => {
        image.src = img.src;
        enable('#recognize');
    }
});

recognizeBtn.addEventListener('click', async () => {
    disable('#recognize', '#file', '#url');
    const langCode = document.querySelector('select').value;
    const text = await recognize(image, langCode);
    displayRecognizedText(text);
    enable('#recognize', '#file', '#url');
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('span.spinner-grow').classList.remove('d-none');
    disable('form button');
    const formdata = new FormData();
    formdata.append('img', document.querySelector('#img').files[0]);
    formdata.append('alignment', Number(document.querySelector('#alignment').checked));
    formdata.append('gaussian', Number(document.querySelector('#gaussian').checked));
    formdata.append('ed', Number(document.querySelector('#ed').checked));
    formdata.append('median', Number(document.querySelector('#median').checked));
    const res = await fetch('https://tesseract-ocr-backend.herokuapp.com/', {
        method: 'POST',
        body: formdata,
        mode: 'cors'
    })
    const { text } = await res.json();
    displayRecognizedText(text);
    document.querySelector('span.spinner-grow').classList.add('d-none');
    enable('form button');

});

async function recognize(img, code) {
    const worker = createWorker({
        logger: m => updateProgress(m)
    });
    await worker.load();
    await worker.loadLanguage(code);
    await worker.initialize(code);
    const { data: { text } } = await worker.recognize(img);
    await worker.terminate();
    return text;
}

function displayRecognizedText(text) {
    document.querySelector('#output').value = text;
}

function updateProgress({ progress, status }) {
    statusSpan.textContent = status;
    progressBar.style.width = `${progress * 100}%`;
    if (status === 'recognizing text' && progress === 1) {
        statusSpan.textContent = 'Done!';
    }
}

function disable(...elements) {
    elements.forEach((el) => {
        document.querySelector(el).disabled = true;
    });
}

function enable(...elements) {
    elements.forEach((el) => {
        document.querySelector(el).disabled = false;
    });
}


function toggleTabs(onTabBtn, offTabBtn) {
    const onTabID = onTabBtn.dataset.target;
    const offTabID = offTabBtn.dataset.target;
    onTabBtn.classList.add('active');
    offTabBtn.classList.remove('active');
    document.querySelector(onTabID).classList.add('show', 'active');
    document.querySelector(offTabID).classList.remove('show', 'active');
}
