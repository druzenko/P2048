const {ccclass, property} = cc._decorator;

import * as ED from "./EventDispatcher"
import Helper from "./Helper";

@ccclass
export default class NewClass extends cc.Component implements ED.EventListener {

    @property ({visible: false}) mIsButtonsActive = false;
    
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

        this.node.active = false;

        let typesSet = new Set<string>();
        typesSet.add("OpenSettingsWindow");
        ED.EventDispatcher.addListener(this, typesSet);
        this.node.zIndex = 100;

        let widget = this.node.getComponent(cc.Widget);
        widget.updateAlignment();
    }

    onButtonClicked(event, customEventData) {

        if (event.currentTarget.name == "BackButton") {

            this.closeSettingsWindow();
        } else if (event.currentTarget.name == "FacebookButton") {

        }
        
        ED.EventDispatcher.dispatchEvent(new ED.Event("PlayAudio", {clip: "ButtonClick"}));
    }

    sliderCallback(slider: cc.Slider) {

        ED.EventDispatcher.dispatchEvent(new ED.Event("SoundVolumeChanged", { "soundVolume": slider.progress }));
    }

    openSettingsWindow() {

        ED.EventDispatcher.dispatchEvent(new ED.Event("OpenTouchBlocker", { target: this.node, time: 0.3 }));
        
        this.node.active = true;
        this.node.scale = 0;
        cc.tween(this.node)
            .to(0.3, {scale: 1})
            .call(() => { this.mIsButtonsActive = true; })
            .start();
    }

    closeSettingsWindow() {

        ED.EventDispatcher.dispatchEvent(new ED.Event("CloseTouchBlocker", { time: 0.3 }));

        this.mIsButtonsActive = false;
        cc.tween(this.node)
            .to(0.3, {scale: 0})
            .call(() => { this.node.active = false; })
            .start();

        ED.EventDispatcher.dispatchEvent(new ED.Event("SaveAudioSettings", null));
    }

    onEventReceived(event: ED.Event): void {

        if (event.type == "OpenSettingsWindow") {

            this.openSettingsWindow();
        }
    }

    // update (dt) {}
}
