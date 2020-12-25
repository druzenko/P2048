const {ccclass, property} = cc._decorator;

import * as ED from "./EventDispatcher"

let Dialogs = {
    "GameOver": {
        text: "Game Over",
        leftButtonText: "Undo",
        rightButtonText: "New Game"
    },
    "EnsureNewGame": {
        text: "Are you sure?",
        leftButtonText: "No",
        rightButtonText: "Yes"
    },
};

@ccclass
export default class GameOverDialog extends cc.Component implements ED.EventListener {

    @property ({visible: false}) mIsButtonsActive = false;

    @property({visible: false}) mCurrentType = "";

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        
        this.node.active = false;

        let typesSet = new Set<string>();
        typesSet.add("OpenDialogPopup");
        //typesSet.add("CloseDialogPopup");
        ED.EventDispatcher.addListener(this, typesSet);
    }

    onDestroy() {

        ED.EventDispatcher.removeListener(this);
    }

    onButtonClicked(event, customEventData) {

        if (this.mIsButtonsActive) {

            if (event.currentTarget.name == "LeftButton") {

                ED.EventDispatcher.dispatchEvent(new ED.Event("DialogPopupLeft", {type: this.mCurrentType}));
            }
            else if (event.currentTarget.name == "RightButton") {
    
                ED.EventDispatcher.dispatchEvent(new ED.Event("DialogPopupRight", {type: this.mCurrentType}));
            }

            ED.EventDispatcher.dispatchEvent(new ED.Event("PlayAudio", {clip: "ButtonClick"}));

            this.closeDialog();
        }
    }

    openDialog(type: string) {

        this.mCurrentType = type;
        let info = Dialogs[type];

        this.node.getChildByName("Label").getComponent(cc.Label).string = info["text"];
        this.node.getChildByName("LeftButton").getChildByName("Background").getChildByName("Label").getComponent(cc.Label).string = info["leftButtonText"];
        this.node.getChildByName("RightButton").getChildByName("Background").getChildByName("Label").getComponent(cc.Label).string = info["rightButtonText"];

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

        if (event.type == "OpenDialogPopup") {

            this.openDialog(event.data["type"]);
        }
        //else if (event.type == "CloseDialogPopup") {

            //this.closeDialog();
        //}
    }

    // update (dt) {}
}
