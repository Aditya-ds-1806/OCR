const { createWorker } = Tesseract;
const image = document.querySelector('#image');
const statusSpan = document.querySelector('#status');
const progressBar = document.querySelector('.progress-bar');

window.onload = async () => {
    const text = await recognize(image);
    displayRecognizedText(text);
}

document.querySelector('#file').addEventListener('change', function (e) {
    const reader = new FileReader();
    const file = this.files[0];
    const img = new Image();
    reader.readAsDataURL(file);
    reader.onload = () => img.src = reader.result;
    img.onload = async () => {
        this.value = '';
        image.src = img.src;
        const text = await recognize(img);
        displayRecognizedText(text);
    }
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
    if (progress === 1) {
        statusSpan.textContent = 'Done!';
        progressBar.style.width = `0%`;
        return;
    }
    statusSpan.textContent = status;
    progressBar.style.width = `${progress * 100}%`;
}
