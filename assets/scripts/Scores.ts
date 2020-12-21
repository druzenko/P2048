import Helper from "./Helper";
import * as ED from "./EventDispatcher"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Scores extends cc.Component implements ED.EventListener {

    // LIFE-CYCLE CALLBACKS:

    @property({visible: false}) mCurrentScore = 0;

    @property({visible: false}) mBestScore = 0;

    @property({visible: false, type: cc.Label}) mCurrentScoreLabel = null;

    @property({visible: false, type: cc.Label}) mBestScoreLabel = null;

    onLoad () {

        let typesSet = new Set<string>();
        typesSet.add("GameReseted");
        typesSet.add("GameLoaded");
        typesSet.add("CurrentScoreChanged");
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

            this.mBestScore = Helper.loadScore(dimension, true);
            this.mBestScoreLabel.string = this.mBestScore.toString();
            this.mCurrentScoreLabel.string = "0";
            this.mCurrentScore = 0;
        } else if (event.type == "GameLoaded") {

            this.mBestScore = Helper.loadScore(dimension, true);
            this.mBestScoreLabel.string = this.mBestScore.toString();
            this.mCurrentScore = Helper.loadScore(dimension, false)
            this.mCurrentScoreLabel.string = this.mCurrentScore.toString();
        } else if ("CurrentScoreChanged") {

            this.mCurrentScore += event.data["diff"];
            this.mCurrentScoreLabel.string = this.mCurrentScore.toString();
            Helper.saveScore(this.mCurrentScore, dimension, false);

            if (this.mCurrentScore > this.mBestScore) {

                this.mBestScore = this.mCurrentScore;
                this.mBestScoreLabel.string = this.mBestScore.toString();
                Helper.saveScore(this.mBestScore, dimension, true);
            }
        }
    }

    // update (dt) {}
}
