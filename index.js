const { createWorker } = Tesseract;
const image = document.querySelector('#image');
const statusSpan = document.querySelector('#status');
const progressBar = document.querySelector('.progress-bar');
const btn = document.querySelector('button');

document.querySelector('#file').addEventListener('change', function (e) {
    const reader = new FileReader();
    const file = this.files[0];
    const img = new Image();
    btn.disabled = true;
    reader.readAsDataURL(file);
    reader.onload = () => img.src = reader.result;
    img.onload = async () => {
        image.src = img.src;
        btn.disabled = false;
    }
});

btn.addEventListener('click', async () => {
    const text = await recognize(image);
    displayRecognizedText(text);
});

async function recognize(img) {
    const worker = createWorker({
        logger: m => updateProgress(m)
    });
    btn.disabled = true;
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(img);
    await worker.terminate();
    return text;
}

function displayRecognizedText(text) {
    document.querySelector('#output').value = text;
    btn.disabled = false;
}

function updateProgress({ progress, status }) {
    statusSpan.textContent = status;
    progressBar.style.width = `${progress * 100}%`;
    if (status === 'recognizing text' && progress === 1) {
        statusSpan.textContent = 'Done!';
    }
}
