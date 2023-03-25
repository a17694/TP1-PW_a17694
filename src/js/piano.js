const pianoKeys = document.querySelectorAll('.white-key, .black-key');
pianoKeys.forEach(key => {
    key.addEventListener('click', () => {
        // toque o som correspondente
        const audio = new Audio('path/to/sound.mp3');
        audio.play();
    });
});