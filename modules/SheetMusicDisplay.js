export default (() => {
    const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(container);
    osmd.FollowCursor = true;
    osmd.EngravingRules.UseXMLMeasureNumbers = false;

    const input = document.getElementById("input");
    input.addEventListener("change", readFile);

    const go = document.getElementById("go");
    go.addEventListener("click", goToMeasure);

    const select = document.getElementById("select");
    select.addEventListener("change", setTrack);

    const view = document.getElementById("view");
    view.addEventListener("change", setView);

    const zoomFactor = document.getElementById("zoomFactor");
    zoomFactor.addEventListener("change", setZoom);

    document.addEventListener("keydown", moveCursor);

    let loadPromise; let parts; let track;
    parse("./data/Aus_meines_Herzens_Grunde.mxl");
    
    function getCurrentNote() {
        const osmdNote = osmd.cursor.NotesUnderCursor()[0];
        if (osmdNote) {
            const pitch = osmdNote.pitch;
            const note = {
                pitch: pitch.fundamentalNote + pitch.AccidentalHalfTones, 
                octave: pitch.octave + 3,
            }
            return note;
        }
    }

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

    function goToNextNote() {
        // Skip tied notes
        while ((osmd.cursor.NotesUnderCursor().length > 0) 
        && osmd.cursor.NotesUnderCursor()[0] 
        && osmd.cursor.NotesUnderCursor()[0].tie
        && osmd.cursor.NotesUnderCursor()[0].tie.Notes.at(-1)
        !== osmd.cursor.NotesUnderCursor()[0]) {
            osmd.cursor.next();
        }

        osmd.cursor.next();

        // Skip rests
        while ((osmd.cursor.NotesUnderCursor().length > 0) 
            && osmd.cursor.NotesUnderCursor()[0].isRest()) {
            osmd.cursor.next();
        }   
    }

    function goToPreviousNote() {
        osmd.cursor.previous();

        // Skip tied notes
        while ((osmd.cursor.NotesUnderCursor().length > 0) 
        && osmd.cursor.NotesUnderCursor()[0] 
        && osmd.cursor.NotesUnderCursor()[0].tie
        && osmd.cursor.NotesUnderCursor()[0].tie.StartNote 
        !== osmd.cursor.NotesUnderCursor()[0]) {
            osmd.cursor.previous();
        }

        // Skip rests
        while ((osmd.cursor.NotesUnderCursor().length > 0) 
            && osmd.cursor.NotesUnderCursor()[0].isRest()) {
            osmd.cursor.previous();
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
            reader.addEventListener("load", (e) => {parse(e.target.result);});
            const name = file.name.toLowerCase();
            if (name.endsWith(".musicxml") || name.endsWith(".xml")) {
                reader.readAsText(file);
            } else if (name.endsWith(".mxl")) {
                reader.readAsBinaryString(file);
            }
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

    function setView() {
        if (view.value === "horizontal") {
            osmd.setOptions({renderSingleHorizontalStaffline: true});
        } else {
            osmd.setOptions({renderSingleHorizontalStaffline: false});
        }
        render();
    }
    
    function setZoom() {
        osmd.zoom = zoomFactor.value;
        render();
    }

    return {
        getCurrentNote: getCurrentNote, 
        goToNextNote: goToNextNote
    };
})();