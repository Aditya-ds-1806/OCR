const { createWorker } = Tesseract;
const image = document.querySelector('#image');

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
        logger: m => console.log(m)
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
