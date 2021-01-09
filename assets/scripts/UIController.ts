const {ccclass, property} = cc._decorator;

import * as ED from "./EventDispatcher";

@ccclass
export default class UIController extends cc.Component implements ED.EventListener {

    @property({visible: false, type: cc.Node}) mModesLayout = null;

    @property({visible: false}) mIsModesShown = false;

    onLoad () {

        let typesSet = new Set<string>();
        typesSet.add("TouchBlockerTouched");
        ED.EventDispatcher.addListener(this, typesSet);
    }

    start () {

        this.mModesLayout = this.node.getChildByName("ModesButton").getChildByName("ModesLayout");
        this.mModesLayout.active = false;
    }

    onDestroy() {

        ED.EventDispatcher.removeListener(this);
    }

    onUIButtonClicked(event, customEventData) {
    
        if (this.mIsModesShown == true) {
            
            this.hideModesLayout();
            ED.EventDispatcher.dispatchEvent(new ED.Event("CloseTouchBlocker", { time: 0.1 }));
        }

        if (event.currentTarget.name == "UndoButton") {

            ED.EventDispatcher.dispatchEvent(new ED.Event("Undo", null));
            
        } else if (event.currentTarget.name == "ResetButton") {

            ED.EventDispatcher.dispatchEvent(new ED.Event("OpenDialogPopup", {type: "EnsureNewGame"}));

        } else if (event.currentTarget.name == "SettingsButton") {

            ED.EventDispatcher.dispatchEvent(new ED.Event("OpenSettingsWindow", null));
            
        } else if (event.currentTarget.name == "LeadersButton") {

        } else if (event.currentTarget.name == "ModesButton") {

            if (this.mIsModesShown == false) {

                this.showModesLayout();
                ED.EventDispatcher.dispatchEvent(new ED.Event("OpenTouchBlocker", { target: this.node, time: 0.1 }));
            }
        } else {

            let dimension = parseInt(event.currentTarget.name);
            ED.EventDispatcher.dispatchEvent(new ED.Event("ModeChanged", { dimension: dimension}));
        }

        ED.EventDispatcher.dispatchEvent(new ED.Event("PlayAudio", {clip: "ButtonClick"}));
    }

    showModesLayout() {
        
        this.mModesLayout.active = true;
        this.mModesLayout.height = 0;
        cc.tween(this.mModesLayout)
            .to(0.1, { height: 1000 })
            .call(() => {this.mIsModesShown = true;})
            .start();
    }

    hideModesLayout() {

        cc.tween(this.mModesLayout)
            .to(0.1, { height: 0 })
            .call(() => {
                this.mModesLayout.active = false;
                this.mIsModesShown = false;
            })
            .start();
    }

    onEventReceived(event: ED.Event): void {

        if (this.mIsModesShown) {

            this.hideModesLayout();
            ED.EventDispatcher.dispatchEvent(new ED.Event("CloseTouchBlocker", { time: 0.1 }));
        }
    }

    // update (dt) {}
}
