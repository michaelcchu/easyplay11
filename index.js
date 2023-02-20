import SoundGenerator from './modules/SoundGenerator.js';
import SheetMusicDisplay from './modules/SheetMusicDisplay.js';

let activePress = null; let press;

function key(e) { 
    function down(e) {
        const strPress = "" + press;
        const badKeys = ["Alt","Arrow","Audio","Enter","Home","Launch","Meta",
            "Play","Tab"];
        const splash = document.querySelector(".splash");
        if (!badKeys.some(badKey => strPress.includes(badKey))
            && !e.repeat && (document.activeElement.nodeName !== 'INPUT') 
            && (press !== activePress) 
            && splash.classList.contains("splash-toggle")) {
                SheetMusicDisplay.goToNextNote();
                const note = SheetMusicDisplay.getCurrentNote();            
                if (note) {
                    SoundGenerator.startPlaying(note, activePress);
                    activePress = press;
                }
        }
    }
    
    function up() {
        if (press === activePress) {
            SoundGenerator.stopPlaying();
            activePress = null;
        }
    }

    if (e.type.includes("key")) {press = e.key;} 
    else {press = e.changedTouches[0].identifier;}
    if (["keydown","touchstart"].includes(e.type)) {down(e);} else {up();}
}

const containerEventTypes = ["touchstart","touchend"];
for (const et of containerEventTypes) {container.addEventListener(et, key);}
const docEventTypes = ["keydown","keyup"];
for (const et of docEventTypes) {document.addEventListener(et, key);}