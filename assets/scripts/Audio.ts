import * as ED from "./EventDispatcher";
import Helper from "./Helper";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AudioNode extends cc.Component implements ED.EventListener {

    @property({visible: false}) mAudioSources = null;

    @property({type: cc.AudioClip}) ButtonClickAudio = null;

    @property({type: cc.AudioClip}) MoveBlockAudio = null;

    @property({visible: false}) SoundVolume = 1.0;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        let typesSet = new Set<string>();
        typesSet.add("PlayAudio");
        typesSet.add("SoundVolumeChanged");
        typesSet.add("SaveAudioSettings");
        ED.EventDispatcher.addListener(this, typesSet);
    }

    onDestroy() {

        ED.EventDispatcher.removeListener(this);
    }

    start () {

        this.mAudioSources = new Map<string, cc.AudioSource>();

        this.mAudioSources.set("ButtonClick", this.ButtonClickAudio);
        this.mAudioSources.set("MoveBlock", this.MoveBlockAudio);

        let SoundVolumeString: string = Helper.loadProperty("SoundVolume");
        if (SoundVolumeString != null) {

            this.SoundVolume = parseFloat(SoundVolumeString);
        }
    }

    onEventReceived(event: ED.Event): void {

        if (event.type == "PlayAudio") {

            let clip = event.data["clip"];
            cc.audioEngine.play(this.mAudioSources.get(clip), false, this.SoundVolume);
        } else if (event.type == "SoundVolumeChanged") {

            this.SoundVolume = event.data["soundVolume"];
        } else if (event.type == "SaveAudioSettings") {

            Helper.saveProperty("SoundVolume", this.SoundVolume.toString());
        }
    }

    // update (dt) {}
}
