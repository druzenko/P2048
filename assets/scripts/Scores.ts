import Helper from "./Helper";
import * as ED from "./EventDispatcher"

const {ccclass, property} = cc._decorator;

let gCurrentScore = 0;
let gBestScore = 0;

@ccclass
export default class Scores extends cc.Component implements ED.EventListener {

    // LIFE-CYCLE CALLBACKS:

    @property({visible: false, type: cc.Label}) mCurrentScoreLabel = null;

    @property({visible: false, type: cc.Label}) mBestScoreLabel = null;

    onLoad () {

        let typesSet = new Set<string>();
        typesSet.add("GameReseted");
        typesSet.add("GameLoaded");
        typesSet.add("CurrentScoreChanged");
        typesSet.add("GameUndone");
        ED.EventDispatcher.addListener(this, typesSet);
    }
    
    start () {

        this.mCurrentScoreLabel = this.node.getChildByName("ScoreLayout").getChildByName("ScoreLabel").getComponent(cc.Label);
        this.mBestScoreLabel = this.node.getChildByName("BestScoreLayout").getChildByName("ScoreLabel").getComponent(cc.Label);
    }

    onDestroy() {

        ED.EventDispatcher.removeListener(this);
    }

    onEventReceived(event: ED.Event): void {

        let dimension = event.data["dimension"];
        if (event.type == "GameReseted") {

            gBestScore = Helper.loadScore(dimension, true);
            this.mBestScoreLabel.string = gBestScore.toString();
            this.mCurrentScoreLabel.string = "0";
            gCurrentScore = 0;
            Helper.saveScore(gCurrentScore, dimension, false);
        } else if (event.type == "GameLoaded") {

            gBestScore = Helper.loadScore(dimension, true);
            this.mBestScoreLabel.string = gBestScore.toString();
            gCurrentScore = Helper.loadScore(dimension, false)
            this.mCurrentScoreLabel.string = gCurrentScore.toString();
        } else if (event.type == "CurrentScoreChanged") {

            gCurrentScore += event.data["diff"];
            this.mCurrentScoreLabel.string = gCurrentScore.toString();
            Helper.saveScore(gCurrentScore, dimension, false);

            if (gCurrentScore > gBestScore) {

                gBestScore = gCurrentScore;
                this.mBestScoreLabel.string = gBestScore.toString();
                Helper.saveScore(gBestScore, dimension, true);
            }
        } else if (event.type == "GameUndone") {

            gCurrentScore = event.data["current"];
            //let bestScore = event.data["best"];

            this.mCurrentScoreLabel.string = gCurrentScore.toString();
            Helper.saveScore(gCurrentScore, dimension, false);

            /*if (bestScore != gBestScore) {

                gBestScore = bestScore;
                this.mBestScoreLabel.string = gBestScore.toString();
                Helper.saveScore(gBestScore, dimension, true);
            }*/
        }
    }

    public static getCurrentScore(): number {

        return gCurrentScore;
    }

    /*public static getBestScore(): number {

        return gBestScore;
    }*/

    // update (dt) {}
}
