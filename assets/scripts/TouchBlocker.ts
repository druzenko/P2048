const {ccclass, property} = cc._decorator;

import * as ED from "./EventDispatcher";

let TouchBlockerTweenTag = 1000;

@ccclass
export default class TouchBlocker extends cc.Component implements ED.EventListener {

    // LIFE-CYCLE CALLBACKS:

    @property({visible: false, type: cc.Node}) mRealTargetParent = null;
    @property({visible: false, type: cc.Node}) mTarget = null;

    onLoad() {

        let typesSet = new Set<string>();
        typesSet.add("OpenTouchBlocker");
        typesSet.add("CloseTouchBlocker");
        ED.EventDispatcher.addListener(this, typesSet);
    }

    onDestroy() {

        ED.EventDispatcher.removeListener(this);
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchEvent, this, true);
    }

    start () {

        this.node.active = false;
        this.node.parent.zIndex = 10000;
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchEvent, this, true);
    }

    onTouchEvent(event: cc.Event.EventTouch) {

        ED.EventDispatcher.dispatchEvent(new ED.Event("TouchBlockerTouched", null));
        event.stopPropagation();
    }

    onEventReceived(event: ED.Event): void {

        let time = event.data["time"];
        if (event.type == "OpenTouchBlocker") {

            if (this.mTarget) {

                this.mTarget.removeFromParent(false);
                this.mRealTargetParent.addChild(this.mTarget);
                cc.Tween.stopAllByTag(TouchBlockerTweenTag);
            }

            this.mTarget = event.data["target"];
            this.node.active = true;
            this.node.opacity = 0;

            this.mRealTargetParent = this.mTarget.parent;
            this.mTarget.removeFromParent(false);
            this.node.parent.addChild(this.mTarget);

            cc.tween(this.node).to(time, {opacity: 125}).start();

        } else if (event.type == "CloseTouchBlocker") {

            cc.tween(this.node)
                .tag(TouchBlockerTweenTag)
                .to(time, {opacity: 0})
                .call(() => {

                    this.mTarget.removeFromParent(false);
                    this.mRealTargetParent.addChild(this.mTarget);
                    this.node.active = false;
                    this.mTarget = null;
                })
                .start();
        }
    }

    // update (dt) {}
}
