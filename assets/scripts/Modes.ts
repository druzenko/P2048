import * as ED from "./EventDispatcher"

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property({visible: false, type: cc.Node}) mModesLayout = null;

    @property({visible: false}) mIsModesShown = false;

    // onLoad () {}

    start () {

        this.mModesLayout = this.node.getChildByName("ModesLayout");
        this.mModesLayout.active = false;
    }

    onModeButtonClicked(event, customEventData) {

        if (event.currentTarget.name == "ModesButton") {

            if (this.mIsModesShown == false) {

                this.showModesLayout();
            } else {
    
                this.hideModesLayout();
            }
        } else {

            let dimension = parseInt(event.currentTarget.name);
            this.hideModesLayout();
            ED.EventDispatcher.dispatchEvent(new ED.Event("ModeChanged", { dimension: dimension}));
        }

        ED.EventDispatcher.dispatchEvent(new ED.Event("PlayAudio", {clip: "ButtonClick"}));
    }

    showModesLayout() {

        this.mModesLayout.active = true;
        this.mModesLayout.height = 0;
        cc.tween(this.mModesLayout).to(0.1, { height: 1000 }).start();
        this.mIsModesShown = true;
    }

    hideModesLayout() {

        this.mIsModesShown = false;
        cc.tween(this.mModesLayout)
            .to(0.1, { height: 0 })
            .call(() => {
                this.mModesLayout.active = false;
            })
            .start();
    }

    // update (dt) {}
}
