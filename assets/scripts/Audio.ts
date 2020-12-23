import * as ED from "./EventDispatcher";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AudioNode extends cc.Component implements ED.EventListener {

    @property({visible: false}) mAudioSources = null;

    @property({type: cc.AudioClip}) ButtonClickAudio = null;

    @property({type: cc.AudioClip}) MoveBlockAudio = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {

        let typesSet = new Set<string>();
        typesSet.add("PlayAudio");
        ED.EventDispatcher.addListener(this, typesSet);
    }

    onDestroy() {

        ED.EventDispatcher.removeListener(this);
    }

    start () {

        this.mAudioSources = new Map<string, cc.AudioSource>();

        let audioComponent = this.node.addComponent(cc.AudioSource);
        audioComponent.clip = this.ButtonClickAudio;
        this.mAudioSources.set("ButtonClick", audioComponent);

        audioComponent = this.node.addComponent(cc.AudioSource);
        audioComponent.clip = this.MoveBlockAudio;
        this.mAudioSources.set("MoveBlock", audioComponent);
    }

    onEventReceived(event: ED.Event): void {

        if (event.type == "PlayAudio") {

            let clip = event.data["clip"];
            this.mAudioSources.get(clip).play();
        }
    }

    // update (dt) {}
}
