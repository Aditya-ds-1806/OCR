const { createWorker } = Tesseract;
const image = document.querySelector('#image');
const statusSpan = document.querySelector('#status');
const progressBar = document.querySelector('.progress-bar');
const btn = document.querySelector('button');
const corsProxy = 'https://cors.bridged.cc/';

document.querySelector('#file').addEventListener('change', function (e) {
    const reader = new FileReader();
    const file = this.files[0];
    const img = new Image();
    disable('button');
    reader.readAsDataURL(file);
    reader.onload = () => img.src = reader.result;
    img.onload = async () => {
        image.src = img.src;
        enable('button');
    }
});

document.querySelector('#url').addEventListener('change', function (e) {
    disable('button');
    const url = corsProxy + this.value;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = async () => {
        image.src = img.src;
        enable('button');
    }
});

btn.addEventListener('click', async () => {
    disable('button', '#file', '#url');
    const text = await recognize(image);
    displayRecognizedText(text);
    enable('button', '#file', '#url');
});

async function recognize(img) {
    const worker = createWorker({
        logger: m => updateProgress(m)
    });
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
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
