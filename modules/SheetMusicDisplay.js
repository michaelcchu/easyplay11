export default (() => {

    let notes; let i;

    function getCurrentNote() {
        let playingNotes = document.querySelectorAll('g.note.playing');
        for (let playingNote of playingNotes) {
            const note = {
                pitch: playingNote.dataset.pname,
                octave: +playingNote.dataset.oct
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
        i++;
        if (i < notes.length) {
            notes[i].classList.add("playing");
        }
    }

    function goToPreviousNote() {
        // Remove the attribute 'playing' of all notes previously playing
        let playingNotes = document.querySelectorAll('g.note.playing');
        for (let playingNote of playingNotes) {
            playingNote.classList.remove("playing");
        }
        i--;
        if (i >= 0) {
            notes[i].classList.add("playing");
        }
    }

    function main() {
        const tk = new verovio.toolkit();
        console.log("Verovio has loaded!");
    
        tk.setOptions({
            svgAdditionalAttribute: ["note@pname", "note@oct"],
            breaks: "none"
        });
        
        function readData(data) {
            tk.loadZipDataBuffer(data);
            document.getElementById("container").innerHTML = tk.renderToSVG(1); 
            notes = document.getElementById("container").querySelectorAll("g.note");
            i = -1;
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
    
        document.addEventListener("keydown", moveCursor);
    
        let loadPromise; let parts; let track;
        //parse("./data/Aus_meines_Herzens_Grunde.mxl");
    
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
        main: main,
        getCurrentNote: getCurrentNote,
        goToNextNote: goToNextNote
    };
})();
