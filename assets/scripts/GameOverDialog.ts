const {ccclass, property} = cc._decorator;

import * as ED from "./EventDispatcher"

@ccclass
export default class GameOverDialog extends cc.Component implements ED.EventListener {

    @property ({visible: false}) mIsButtonsActive = false;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        
        this.node.active = false;

        let typesSet = new Set<string>();
        typesSet.add("GameOverDialogOpen");
        typesSet.add("GameOverDialogClose");
        ED.EventDispatcher.addListener(this, typesSet);
    }

    onDestroy() {

        ED.EventDispatcher.removeListener(this);
    }

    onButtonClicked(event, customEventData) {

        if (this.mIsButtonsActive) {

            if (customEventData == "Undo") {

                ED.EventDispatcher.dispatchEvent(new ED.Event("GameOverDialogUndo", null));
            }
            else if (customEventData == "NewGame") {
    
                ED.EventDispatcher.dispatchEvent(new ED.Event("GameOverDialogNewGame", null));
            }

            ED.EventDispatcher.dispatchEvent(new ED.Event("PlayAudio", {clip: "ButtonClick"}));

            this.closeDialog();
        }
    }

    openDialog() {

        this.node.active = true;
        this.node.scale = 0;
        cc.tween(this.node)
            .to(0.3, {scale: 1})
            .call(() => { this.mIsButtonsActive = true; })
            .start();

        ED.EventDispatcher.dispatchEvent(new ED.Event("OpenTouchBlocker", { target: this.node, time: 0.3 }));
    }

    closeDialog() {

        this.mIsButtonsActive = false;
        cc.tween(this.node)
            .to(0.3, {scale: 0})
            .call(() => { this.node.active = false; })
            .start();

        ED.EventDispatcher.dispatchEvent(new ED.Event("CloseTouchBlocker", { time: 0.3 }));
    }

    onEventReceived(event: ED.Event): void {

        if (event.type == "GameOverDialogOpen") {

            this.openDialog();
        }
        else if (event.type == "GameOverDialogClose") {

            this.closeDialog();
        }
    }

    // update (dt) {}
}
