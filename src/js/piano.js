const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const getElementByNote = (note) =>
    note && document.querySelector(`[note="${note}"]`);

const keys = {
    A: {element: getElementByNote("C"), note: "C", octaveOffset: 0},
    W: {element: getElementByNote("C#"), note: "C#", octaveOffset: 0},
    S: {element: getElementByNote("D"), note: "D", octaveOffset: 0},
    E: {element: getElementByNote("D#"), note: "D#", octaveOffset: 0},
    D: {element: getElementByNote("E"), note: "E", octaveOffset: 0},
    F: {element: getElementByNote("F"), note: "F", octaveOffset: 0},
    T: {element: getElementByNote("F#"), note: "F#", octaveOffset: 0},
    G: {element: getElementByNote("G"), note: "G", octaveOffset: 0},
    Y: {element: getElementByNote("G#"), note: "G#", octaveOffset: 0},
    H: {element: getElementByNote("A"), note: "A", octaveOffset: 1},
    U: {element: getElementByNote("A#"), note: "A#", octaveOffset: 1},
    J: {element: getElementByNote("B"), note: "B", octaveOffset: 1},
    K: {element: getElementByNote("C2"), note: "C", octaveOffset: 1},
    O: {element: getElementByNote("C#2"), note: "C#", octaveOffset: 1},
    L: {element: getElementByNote("D2"), note: "D", octaveOffset: 1},
    P: {element: getElementByNote("D#2"), note: "D#", octaveOffset: 1},
    semicolon: {element: getElementByNote("E2"), note: "E", octaveOffset: 1}
};

const getHz = (note = "A", octave = 4) => {
    const A4 = 440;
    let N = 0;
    switch (note) {
        default:
        case "A":
            N = 0;
            break;
        case "A#":
        case "Bb":
            N = 1;
            break;
        case "B":
            N = 2;
            break;
        case "C":
            N = 3;
            break;
        case "C#":
        case "Db":
            N = 4;
            break;
        case "D":
            N = 5;
            break;
        case "D#":
        case "Eb":
            N = 6;
            break;
        case "E":
            N = 7;
            break;
        case "F":
            N = 8;
            break;
        case "F#":
        case "Gb":
            N = 9;
            break;
        case "G":
            N = 10;
            break;
        case "G#":
        case "Ab":
            N = 11;
            break;
    }
    N += 12 * (octave - 4);
    return A4 * Math.pow(2, N / 12);
};

const pressedNotes = new Map();
let clickedKey = "";

const playKey = (key) => {
    if (!keys[key]) {
        return;
    }

    const osc = audioContext.createOscillator();
    const noteGainNode = audioContext.createGain();
    noteGainNode.connect(audioContext.destination);

    const zeroGain = 0.00001;
    const maxGain = 0.5;
    const sustainedGain = 0.001;

    noteGainNode.gain.value = zeroGain;

    const setAttack = () =>
        noteGainNode.gain.exponentialRampToValueAtTime(
            maxGain,
            audioContext.currentTime + 0.01
        );
    const setDecay = () =>
        noteGainNode.gain.exponentialRampToValueAtTime(
            sustainedGain,
            audioContext.currentTime + 1
        );
    const setRelease = () =>
        noteGainNode.gain.exponentialRampToValueAtTime(
            zeroGain,
            audioContext.currentTime + 2
        );

    setAttack();
    setDecay();
    setRelease();

    osc.connect(noteGainNode);
    osc.type = "triangle";

    const freq = getHz(keys[key].note, (keys[key].octaveOffset || 0) + 3);

    if (Number.isFinite(freq)) {
        osc.frequency.value = freq;
    }

    keys[key].element.classList.add("pressed");
    pressedNotes.set(key, osc);
    pressedNotes.get(key).start();
};

function stopKey(key) {
    if (!keys[key]) {
        return;
    }

    keys[key].element.classList.remove("pressed");
    const osc = pressedNotes.get(key);

    if (osc) {
        setTimeout(() => {
            osc.stop();
        }, 2000);

        pressedNotes.delete(key);
    }
};

document.addEventListener("keydown", (e) => {
    const eventKey = e.key.toUpperCase();
    const key = eventKey === ";" ? "semicolon" : eventKey;

    if (!key || pressedNotes.get(key)) {
        return;
    }
    playKey(key);
});

document.addEventListener("keyup", (e) => {
    const eventKey = e.key.toUpperCase();
    const key = eventKey === ";" ? "semicolon" : eventKey;

    if (!key) {
        return;
    }
    stopKey(key);
});

for (const [key, {element}] of Object.entries(keys)) {
    element.addEventListener("mousedown", () => {
        playKey(key);
        clickedKey = key;
    });
}

document.addEventListener("mouseup", () => {
    stopKey(clickedKey);
});