const { createWorker } = Tesseract;
const image = document.querySelector('#image');

const worker = createWorker({
    logger: m => console.log(m)
});

document.querySelector('#file').addEventListener('change', function (e) {
    const reader = new FileReader();
    const file = this.files[0];
    const img = new Image();
    reader.readAsDataURL(file);
    reader.onload = () => img.src = reader.result;
    img.onload = async () => {
        this.value = '';
        image.src = img.src;
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(img);
        await worker.terminate()
        document.querySelector('#output').value = text;
    }
});
