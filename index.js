import SoundGenerator from './modules/SoundGenerator.js';
import SheetMusicDisplay from './modules/SheetMusicDisplay.js';

let activePress = null; let press;

function key(e) {
    e.preventDefault();
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
    else {press = e.pointerId;}
    if (["keydown","pointerdown"].includes(e.type)) {down(e);} else {up();}
}

// Initialize canvas
const canvas = document.getElementById("tap-area");
//const context = canvas.getContext("2d");
//context.fillStyle="#FF0000";
//context.fillRect(0,0,canvas.width,canvas.height);

// Event listeners
const eventTypes = ["down","up"];
for (const et of eventTypes) {document.addEventListener("key"+et, key);}
for (const et of eventTypes) {canvas.addEventListener("pointer"+et, key);}

/*
for (const et of eventTypes) {canvas.addEventListener("pointer"+et, key,
    {passive: false});}
*/

/*
// Turn off default event listeners
canvas.addEventListener('focus', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

//
  canvas.addEventListener('pointerover', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

  canvas.addEventListener('pointerenter', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

  canvas.addEventListener('pointerdown', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

  canvas.addEventListener('touchstart', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

  canvas.addEventListener('gotpointercapture', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false);

  canvas.addEventListener('pointermove', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false);

  canvas.addEventListener('touchmove', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false);

  canvas.addEventListener('pointerup', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

  canvas.addEventListener('lostpointercapture', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

  canvas.addEventListener('pointerout', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

  canvas.addEventListener('pointerleave', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false); 

  canvas.addEventListener('touchend', function(event) {
    event.preventDefault();
    event.stopPropagation();
  }, false);
  */