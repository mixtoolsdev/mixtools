document.addEventListener('DOMContentLoaded', () => {
    const walkmanInput = document.getElementById('walkman-input');
    const walkmanToUnicodeBtn = document.getElementById('walkman-to-unicode');
    const walkmanResult = document.getElementById('walkman-result');
    const unicodeInput = document.getElementById('unicode-input');
    const unicodeToKrutidevBtn = document.getElementById('unicode-to-krutidev');
    const krutidevResult = document.getElementById('krutidev-result');

    // Walkman Chanakya to Unicode Mapping (बेसिक मैपिंग, पूर्ण मैपिंग के लिए ऑनलाइन सोर्स से ऐड करें)
    const walkmanToUnicodeMap = {
        'a': 'अ', 'A': 'आ', 'i': 'इ', 'I': 'ई', 'u': 'उ', 'U': 'ऊ', 'e': 'ए', 'E': 'ऐ', 'o': 'ओ', 'O': 'औ', 
        'k': 'क', 'K': 'ख', 'g': 'ग', 'G': 'घ', 'c': 'च', 'C': 'छ', 'j': 'ज', 'J': 'झ', 'T': 'ट', 'D': 'ड', 
        // और मैपिंग ऐड करें, उदाहरण के लिए https://github.com/assistech-iitdelhi/InDesignFontConverters से tsv लें
        // पूर्ण मैपिंग के लिए 200+ एंट्रीज हैं, यहां बेसिक है
    };

    walkmanToUnicodeBtn.addEventListener('click', () => {
        const inputText = walkmanInput.value;
        let convertedText = '';
        for (let char of inputText) {
            convertedText += walkmanToUnicodeMap[char] || char;
        }
        walkmanResult.textContent = convertedText;
    });

    // Unicode to KrutiDev Mapping (बेसिक मैपिंग, पूर्ण के लिए https://github.com/TGNYC/Kriti-Dev-to-Unicode से लें)
    const unicodeToKrutiMap = {
        'अ': 'v', 'आ': 'vk', 'इ': 'b', 'ई': 'B', 'उ': 'm', 'ऊ': 'M', 'ए': 's', 'ऐ': 'S', 'ओ': 'vks', 'औ': 'vkS',
        'क': 'd', 'ख': '[k', 'ग': 'x', 'घ': 'Xk', 'च': 'p', 'छ': 'N', 'ज': 't', 'झ': 'Tk', 'ट': 'b', 'ड': 'M', 
        // और मैपिंग ऐड करें, उदाहरण के लिए पूर्ण मैपिंग 300+ एंट्रीज हैं
    };

    unicodeToKrutidevBtn.addEventListener('click', () => {
        const inputText = unicodeInput.value;
        let convertedText = '';
        for (let char of inputText) {
            convertedText += unicodeToKrutiMap[char] || char;
        }
        krutidevResult.textContent = convertedText;
    });
});
