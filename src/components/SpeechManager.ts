// Based on https://codepen.io/rodhamjun/pen/BGvrqr
export default class SpeechManager {
    uttr = new SpeechSynthesisUtterance();
    text = "";
    lang = "en-US";

    init () {
        // Check for browser support
        if (!("speechSynthesis" in window)) {
            console.log("Sorry. Your browser <strong>does not support</strong> speech synthesis.");
            return;
        }

        this.uttr.text = this.text;
        this.uttr.rate = 0.3;

        this.uttr.voice = speechSynthesis
            .getVoices()
            .filter(voice => voice.lang == this.lang)[0];
    }

    setText(text: string) {
        this.text = text;
    }

    setLang(lang: string) {
        this.lang = lang;
    }

    onStart(handler: () => void) {
        this.uttr.onstart = handler;
    }

    onEnd(handler: () => void) {
        this.uttr.onend = handler;
        this.uttr.onerror = (e) => {
            if (e.error !== "interrupted") {
                console.log("Speech failed because of", e.error);
            }
            handler();
        };
    }

    onSpeechClicked(e: Event) {
        if (!speechSynthesis.speaking) {
            this.speak();
        } else {
            this.stop();
        }
    }

    speak() {
        this.uttr.text = this.text;
        this.uttr.rate = 0.3;
        this.uttr.lang = this.lang;

        speechSynthesis.speak(this.uttr);
        
    }

    stop() {
        speechSynthesis.pause();
        speechSynthesis.cancel();
    }
}
