document.addEventListener('DOMContentLoaded', () => {
    const tiles = document.querySelectorAll('.tool-tile');
    const modal = document.getElementById('tool-modal');
    const close = document.querySelector('.close');
    const title = document.getElementById('tool-title');
    const input = document.getElementById('file-input');
    const btn = document.getElementById('process-btn');
    const result = document.getElementById('result');
    const progressBar = document.getElementById('progress-bar');
    const progressFill = document.getElementById('progress-fill');
    let currentTool = '';

    tiles.forEach(tile => {
        tile.addEventListener('click', () => {
            currentTool = tile.dataset.tool;
            title.textContent = tile.querySelector('h3').textContent;
            modal.classList.remove('hidden');
            input.accept = currentTool.includes('word') ? '.docx' : '.pdf, .jpg, .png';
            input.multiple = ['merge', 'images-to-pdf'].includes(currentTool);
            progressBar.classList.add('hidden');
            result.innerHTML = '';
        });
    });

    close.addEventListener('click', () => modal.classList.add('hidden'));

    btn.addEventListener('click', async () => {
        const files = input.files;
        if (!files.length) return alert('Please select a file');
        result.innerHTML = '<p class="text-gray-600">Processing...</p>';
        progressBar.classList.remove('hidden');
        progressFill.style.width = '0%';

        try {
            const { PDFDocument } = pdfLib; // सही इम्पोर्ट
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                if (progress > 100) progress = 100;
                progressFill.style.width = `${progress}%`;
                if (progress === 100) clearInterval(interval);
            }, 200);

            if (currentTool === 'merge') {
                const pdfDoc = await PDFDocument.create();
                for (let file of files) {
                    const arrayBuffer = await file.arrayBuffer();
                    const srcDoc = await PDFDocument.load(arrayBuffer);
                    const pages = await pdfDoc.copyPages(srcDoc, srcDoc.getPageIndices());
                    pages.forEach(page => pdfDoc.addPage(page));
                }
                const pdfBytes = await pdfDoc.save();
                download(pdfBytes, 'merged.pdf', 'application/pdf');
            } else if (currentTool === 'split') {
                const file = files[0];
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                const pageCount = pdfDoc.getPageCount();
                const ranges = prompt('Enter page ranges (e.g., 1,3,5-7) or leave blank for all:') || '';
                let pagesToSplit = [];
                if (ranges) {
                    const rangeArray = ranges.split(',').map(r => r.trim());
                    rangeArray.forEach(r => {
                        if (r.includes('-')) {
                            const [start, end] = r.split('-').map(Number);
                            for (let i = start; i <= end && i <= pageCount; i++) pagesToSplit.push(i - 1);
                        } else {
                            const num = parseInt(r);
                            if (num > 0 && num <= pageCount) pagesToSplit.push(num - 1);
                        }
                    });
                } else {
                    pagesToSplit = Array.from({ length: pageCount }, (_, i) => i);
                }
                for (let i of pagesToSplit) {
                    const newDoc = await PDFDocument.create();
                    const [page] = await newDoc.copyPages(pdfDoc, [i]);
                    newDoc.addPage(page);
                    const newBytes = await newDoc.save();
                    download(newBytes, `page-${i+1}.pdf`, 'application/pdf');
                }
            } else if (currentTool === 'compress') {
                const file = files[0];
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
                download(pdfBytes, 'compressed.pdf', 'application/pdf');
            } else if (currentTool === 'pdf-to-jpg') {
                const file = files[0];
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const dataUrls = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    const context = canvas.getContext('2d');
                    await page.render({ canvasContext: context, viewport }).promise;
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
                    await new Promise(resolve => (img.onload = resolve));
                    if (i > 0) doc.addPage();
                    doc.addImage(img, 'JPEG', 10, 10, 190, 0);
                }
                download(doc.output('arraybuffer'), 'images.pdf', 'application/pdf');
            } else if (currentTool === 'pdf-to-word') {
                const file = files[0];
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    fullText += content.items.map(item => item.str).join(' ') + '\n\n';
                }
                download(new Blob([fullText], { type: 'text/plain' }), 'document.txt', 'text/plain');
            } else if (currentTool === 'word-to-pdf') {
                const file = files[0];
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                doc.text(result.value, 10, 10);
                download(doc.output('arraybuffer'), 'document.pdf', 'application/pdf');
            } else if (currentTool === 'rotate') {
                const file = files[0];
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer);
                const degrees = parseInt(prompt('Rotation degrees (90, 180, 270):'));
                if ([90, 180, 270].includes(degrees)) {
                    const pages = pdfDoc.getPages();
                    pages.forEach(page => page.setRotation(PDFLib.degrees(degrees)));
                    const pdfBytes = await pdfDoc.save();
                    download(pdfBytes, 'rotated.pdf', 'application/pdf');
                } else {
                    alert('Only 90, 180, or 270 degrees are supported.');
                }
            } else if (currentTool === 'extract-text') {
                const file = files[0];
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let extractedText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    extractedText += `Page ${i}:\n` + content.items.map(item => item.str).join(' ') + '\n\n';
                }
                download(new Blob([extractedText], { type: 'text/plain' }), 'extracted-text.txt', 'text/plain');
            }
            result.innerHTML = '<p class="text-green-600">Done!</p>';
            progressFill.style.width = '100%';
        } catch (err) {
            result.innerHTML = '<p class="text-red-600">Error: ' + err.message + '</p>';
            console.error(err);
            progressBar.classList.add('hidden');
        }
    });

    function download(data, name, type) {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
    }
});
