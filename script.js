document.addEventListener('DOMContentLoaded', () => {
    const tiles = document.querySelectorAll('.tool-tile');
    const modal = document.getElementById('tool-modal');
    const close = document.querySelector('.close');
    const title = document.getElementById('tool-title');
    const input = document.getElementById('file-input');
    const btn = document.getElementById('process-btn');
    const result = document.getElementById('result');
    let currentTool = '';

    tiles.forEach(tile => {
        tile.addEventListener('click', () => {
            currentTool = tile.dataset.tool;
            title.textContent = tile.textContent;
            modal.style.display = 'block';
            input.accept = currentTool.includes('word') ? '.docx' : '.pdf, .jpg, .png';
            input.multiple = ['merge', 'images-to-pdf'].includes(currentTool);
        });
    });

    close.addEventListener('click', () => modal.style.display = 'none');

    btn.addEventListener('click', async () => {
        const files = input.files;
        if (!files.length) return alert('कृपया फाइल चुनें');
        result.innerHTML = 'प्रोसेसिंग...';

        try {
            const { PDFDocument } = PDFLib;
            if (currentTool === 'merge') {
                const pdfDoc = await PDFDocument.create();
                for (let file of files) {
                    const bytes = new Uint8Array(await file.arrayBuffer());
                    const srcDoc = await PDFDocument.load(bytes);
                    const pages = await pdfDoc.copyPages(srcDoc, srcDoc.getPageIndices());
                    pages.forEach(page => pdfDoc.addPage(page));
                }
                const pdfBytes = await pdfDoc.save();
                download(pdfBytes, 'merged.pdf', 'application/pdf');
            } else if (currentTool === 'split') {
                const file = files[0];
                const bytes = new Uint8Array(await file.arrayBuffer());
                const pdfDoc = await PDFDocument.load(bytes);
                for (let i = 0; i < pdfDoc.getPageCount(); i++) {
                    const newDoc = await PDFDocument.create();
                    const [page] = await newDoc.copyPages(pdfDoc, [i]);
                    newDoc.addPage(page);
                    const newBytes = await newDoc.save();
                    download(newBytes, `page-${i+1}.pdf`, 'application/pdf');
                }
            } else if (currentTool === 'compress') {
                alert('कंप्रेस फीचर अभी डेवलपमेंट में है'); // Placeholder
            } else if (currentTool === 'pdf-to-jpg') {
                const file = files[0];
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                const dataUrls = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
                    dataUrls.push(canvas.toDataURL('image/jpeg'));
                }
                dataUrls.forEach((url, i) => {
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `page-${i+1}.jpg`;
                    a.click();
                });
            } else if (currentTool === 'images-to-pdf') {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                for (let i = 0; i < files.length; i++) {
                    const img = new Image();
                    img.src = URL.createObjectURL(files[i]);
                    await new Promise(resolve => img.onload = resolve);
                    if (i > 0) doc.addPage();
                    doc.addImage(img, 'JPEG', 10, 10, 190, 0);
                }
                download(doc.output('arraybuffer'), 'images.pdf', 'application/pdf');
            } else if (currentTool === 'pdf-to-word') {
                const file = files[0];
                pdfjsLib.getDocument(await file.arrayBuffer()).promise.then(pdf => {
                    pdf.getPage(1).then(page => page.getTextContent().then(content => {
                        const text = content.items.map(item => item.str).join('\n');
                        download(new Blob([text], { type: 'text/plain' }), 'document.txt', 'text/plain');
                    }));
                });
            } else if (currentTool === 'word-to-pdf') {
                const file = files[0];
                const arrayBuffer = await file.arrayBuffer();
                mammoth.convertToHtml({ arrayBuffer }).then(result => {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    doc.text(result.value, 10, 10);
                    download(doc.output('arraybuffer'), 'document.pdf', 'application/pdf');
                });
            } else if (currentTool === 'rotate') {
                alert('रोटेट फीचर अभी डेवलपमेंट में है'); // Placeholder
            }
            result.innerHTML = 'काम पूरा हुआ!';
        } catch (err) {
            result.innerHTML = 'एरर: ' + err.message;
            console.error(err);
        }
    });

    function download(bytes, name, type) {
        const blob = new Blob([bytes], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
    }
});