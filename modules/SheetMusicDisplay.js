export default (() => {

    let notes; let i; let tk; let mei;

    const val = {"c":0,"d":2,"e":4,"f":5,"g":7,"a":9,"b":11,"#":1,"&":-1,"":0};
    const accidentalVal = {null:0,"s":1,"f":-1,"ss":2,"x":2,"ff":-2,"xs":3,
    "sx":3,"ts":3,"tf":-3,"n":0,"nf":0,"ns":0,
    "su":0.75,"sd":0.25,"fu":-0.25,"fd":-0.75,"nu":0,"nd":0}

    function getCurrentNote() {
        let playingNotes = document.querySelectorAll('g.note.playing');
        for (let playingNote of playingNotes) {
            const id = playingNote.getAttribute("id");
            const meiNote = mei.querySelector("[*|id='"+id+"']");
            let pitch = val[meiNote.getAttribute("pname")];
            const accidGes = meiNote.getAttribute("accid.ges");
            const accid = meiNote.getAttribute("accid");
            if (accid) {
                pitch += accidentalVal[accid];
            } else {
                pitch += accidentalVal[accidGes];
            }
            const note = {
                pitch: pitch,
                octave: +meiNote.getAttribute("oct")
            }
            return note;
        }
    }

    function goToNextNote() {
        // Remove the attribute 'playing' of all notes previously playing
        let playingNotes = document.querySelectorAll('g.note.playing');
        for (let playingNote of playingNotes) {
            playingNote.classList.remove("playing");
        }
        if (i < notes.length) {
            i++;
            if (i < notes.length) {
                const id = notes[i].getAttribute("xml:id");
                const note = document.getElementById(id);
                note.classList.add("playing");
                setTimeout(() => {seamless.scrollIntoView(note);}, 0);
           }
        }
    }

    function goToPreviousNote() {
        // Remove the attribute 'playing' of all notes previously playing
        let playingNotes = document.querySelectorAll('g.note.playing');
        for (let playingNote of playingNotes) {
            playingNote.classList.remove("playing");
        }
        if (i >= 0) {
            i--;
            if (i >= 0) {
                const id = notes[i].getAttribute("xml:id");
                const note = document.getElementById(id);
                note.classList.add("playing");
                note.scrollIntoView({ block: "center"});
            }
        }
    }

    function main() {
        tk = new verovio.toolkit();
        console.log("Verovio has loaded!");
    
        tk.setOptions({
            breaks: "none",
            mnumInterval: 1,
            scale: 75
        });
        
        function readData(data) {
            tk.loadZipDataBuffer(data);
            document.getElementById("container").innerHTML = tk.renderToSVG(1); 
            i = -1;
            const meiContent = tk.getMEI();
            const parser = new DOMParser();
            mei = parser.parseFromString(meiContent, "text/xml");
            console.log(mei);
            notes = Array.from(mei.querySelectorAll("note"));

            // Remove tied notes
            const ties = mei.querySelectorAll("tie");
            for (const tie of ties) {
                const skipNoteId = tie.getAttribute("endid").slice(1);
                const skipNoteIndex = notes.findIndex((note) => {
                    return (note.getAttribute("xml:id") === skipNoteId);
                });
                notes.splice(skipNoteIndex, 1);
            }

        }
    
        fetch("./data/Beethoven__Symphony_No._9__Op._125-Clarinetto_1_in_C_(Clarinet).mxl")
        .then( response => response.arrayBuffer() )
        .then( data => {readData(data);} )
        .catch( e => {console.log( e );} );
    
        const input = document.getElementById("input");
        input.addEventListener("change", readFile);
    
        const go = document.getElementById("go");
        go.addEventListener("click", goToMeasure);
    
        const select = document.getElementById("select");
        select.addEventListener("change", setTrack);
    
        const zoomFactor = document.getElementById("zoomFactor");
        zoomFactor.addEventListener("change", setZoom);

        let interval;
        function repeat(f) {interval = setInterval(f, 200);}
        function stopMoving() {clearInterval(interval);}

        const left = document.getElementById("move-left");
        left.addEventListener("pointerdown", () => {repeat(goToPreviousNote);});
        left.addEventListener("pointerup", stopMoving);

        const right = document.getElementById("move-right");
        right.addEventListener("pointerdown", () => {repeat(goToNextNote);});
        right.addEventListener("pointerup", stopMoving);

        document.addEventListener("keydown", moveCursor);

        let loadPromise; let parts; let track;
    
        function goToMeasure() {
            function getCurrentMeasure() {
                return osmd.cursor.iterator.currentMeasure.measureNumber;
            }
            if (osmd.cursor) {
                let measure = +measureInput.value;
                const first = osmd.sheet.FirstMeasureNumber;
                const last = osmd.sheet.LastMeasureNumber;
                if (measure < first) {
                    measure = first;
                } else if (measure > last) {
                    measure = last;
                }
                if (getCurrentMeasure() < measure) {
                    while (getCurrentMeasure() < measure) {osmd.cursor.next();}
                    osmd.cursor.previous();
                } else if (getCurrentMeasure() > measure) {
                    if (measure === 1) {
                        osmd.cursor.reset();
                        osmd.cursor.previous();
                    } else {
                        while (getCurrentMeasure() > measure - 1) {
                            osmd.cursor.previous();
                        }
                    }
                }
                document.activeElement.blur();
            }
        }

        function moveCursor(e) {
            if (document.activeElement.nodeName !== 'INPUT') {
                if (e.key === "ArrowLeft") {goToPreviousNote();}
                else if (e.key === "ArrowRight") {goToNextNote();}
            }   
        }
    
        function parse(text) {
            loadPromise = osmd.load(text);
            loadPromise.then(() => {
               // replace the old track options with new track options 
               while (select.options.length) {select.options.remove(0);}
               parts = osmd.sheet.Instruments;
               for (let i = 0; i < parts.length; i++) {
                   const option = document.createElement("option");
                   option.text = parts[i].nameLabel.text; select.add(option);
               }
               setTrack(null, true);
           });
        }
    
        function readFile() {    
            for (const file of input.files) {
                const reader = new FileReader();
                reader.addEventListener("load", (e) => {readData(e.target.result)});
                reader.readAsArrayBuffer(file);
            }
        }
    
        function render(reset=false) {
            if (loadPromise) {
                loadPromise.then(() => {
                    osmd.render();
                    if (reset) {
                        osmd.cursor.reset();
                        osmd.cursor.previous();
                    }
                    osmd.cursor.show();
                    document.activeElement.blur();
                });
            }
        }
    
        function setTrack(e, reset=false) {
            track = select.selectedIndex;
            for (let i = 0; i < parts.length; i++) {
                osmd.sheet.Instruments[i].Visible = (i === track);
            }
            render(reset);
        }
        
        function setZoom() {
            osmd.zoom = zoomFactor.value;
            render();
        }
    }
        
    document.addEventListener("DOMContentLoaded", () => {
        verovio.module.onRuntimeInitialized = main;
    });

    return {
        getCurrentNote: getCurrentNote,
        goToNextNote: goToNextNote
    };
})();
