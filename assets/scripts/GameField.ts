// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import Helper from "./Helper";

cc.macro.ENABLE_MULTI_TOUCH = false;

const {ccclass, property} = cc._decorator;

const enum eTouchMoveDirection {

    None,
    Right,
    Left,
    Up,
    Down
}

export class CellInfo {

    public block:  cc.Node;
    public value:  number;
    constructor() {
        this.block = null;
        this.value = 0;
    }
}

@ccclass
export default class GameField extends cc.Component {

    @property({tooltip: 'Game field dimension'})
    dimension = 4;

    @property({tooltip: 'Max game field dimension'})
    mMaxDimension = 12;

    @property
    gameFieldArcRadius = 50;

    @property
    moveBlockTime = 0.1;

    @property({visible: false}) mBlockSize = 0;

    @property({visible: false}) mSpan = 0;

    @property({visible: false}) mGameFieldSize = 0;

    @property({visible: false}) mIsTouchStarted = false;

    @property({visible: false}) mTouchStartPosition = null;

    @property({visible: false}) wasAnyMove = false;

    @property({visible: false, type: Array}) mCells = new Array<Array<CellInfo>>(this.mMaxDimension);

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

        for (let x = 0; x < this.mMaxDimension; ++x)
        {
            this.mCells[x] = new Array<CellInfo>(this.mMaxDimension);
            for (let y = 0; y < this.mMaxDimension; ++y)
            {
                this.mCells[x][y] = new CellInfo();
            }
        }

        var graphicsComponent = this.node.getComponent(cc.Graphics);

        var fillColor = new cc.Color(0, 0, 255, 50);
        graphicsComponent.fillColor = fillColor;

        this.mGameFieldSize = this.node.width;
        var startCoordX = -0.5 * this.mGameFieldSize;
        var startCoordY = startCoordX;

        graphicsComponent.roundRect(startCoordX, startCoordY, this.mGameFieldSize, this.mGameFieldSize, this.gameFieldArcRadius);

        graphicsComponent.fill();

        fillColor = new cc.Color(0, 0, 255, 255);
        graphicsComponent.fillColor = fillColor;

        this.mSpan = 20;
        this.mBlockSize = (this.mGameFieldSize - (this.dimension + 1) * this.mSpan) / this.dimension;

        for (var i = 0; i < this.dimension; ++i)
        {
            for (var j = 0; j < this.dimension; ++j)
            {
                graphicsComponent.roundRect(startCoordX + (i + 1) * this.mSpan + i * this.mBlockSize, startCoordY + (j + 1) * this.mSpan + j * this.mBlockSize,
                                            this.mBlockSize, this.mBlockSize, this.gameFieldArcRadius);
                graphicsComponent.fill();
            }
        }
        
        let save = Helper.loadGame(this.dimension);
        
        let isSaveValid = false;

        if (save != undefined && save != null) {

            save = save.slice(1, -1)
            let splited = save.split(",");

            if (splited.length % 3 == 0 && splited.length >= 6) {

                for (let i = 0; i < splited.length; i += 3) {
                    
                    this.spawnBlockAtCell(
                        Helper.GetCellNumberByCellCoordinates(parseInt(splited[i]), parseInt(splited[i + 1]), this.dimension),
                        parseInt(splited[i + 2]));
                }
                isSaveValid = true;
            }
        }

        if (!isSaveValid) {

            this.restartGame();
        }

        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        this.node.parent.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this, true);
        this.node.parent.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this, true);
    }

    onDestroy() {

        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        this.node.parent.off(cc.Node.EventType.TOUCH_END, this.onTouchStart, this, true);
        this.node.parent.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchStart, this, true);
    }

    onTouchStart(event: cc.Event.EventTouch) {

        if (!this.mIsTouchStarted)
        {
            this.mIsTouchStarted = true;
            this.mTouchStartPosition = event.getLocation();
        }
    }

    onTouchEnd(event: cc.Event.EventTouch) {

        if (this.mIsTouchStarted)
        {
            var endTouchLocation = event.getLocation();
            var dx = endTouchLocation.x - this.mTouchStartPosition.x;
            var dy = endTouchLocation.y - this.mTouchStartPosition.y;

            if (cc.Vec2.distance(this.mTouchStartPosition, endTouchLocation) > 10)
            {
                if (Math.abs(dx) > Math.abs(dy))
                {
                    (dx > 0) ? this.moveBlocks(eTouchMoveDirection.Right) : this.moveBlocks(eTouchMoveDirection.Left);
                }
                else
                {
                    (dy > 0) ? this.moveBlocks(eTouchMoveDirection.Up) : this.moveBlocks(eTouchMoveDirection.Down);
                }
            }

            this.mIsTouchStarted = false;

            if (this.wasAnyMove) {

                this.spawnNewBlock();
            }
        }
    }

    spawnNewBlock() {

        let emptyCells = new Array<number>();

        for (let x = 0; x < this.dimension; ++x) {

            for (let y = 0; y < this.dimension; ++y) {

                if (this.mCells[x][y].block == null) {

                    emptyCells.push(y * this.dimension + x);
                }
            }
        }

        cc.tween(this.node)
            .delay(this.moveBlockTime)
            .call(() => {
                this.spawnBlockAtCell(emptyCells[Helper.RandomIntInRange(0, emptyCells.length - 1)]);
                Helper.saveGame(this.mCells, this.dimension);
            })
            .start();
        
    }

    moveBlocks(direction: eTouchMoveDirection) {

        this.wasAnyMove = false;

        switch (direction)
        {
            case eTouchMoveDirection.Right: {

                for (let y = 0; y < this.dimension; ++y)
                {
                    for (let x = this.dimension - 1; x >= 0; --x)
                    {
                        if (this.mCells[x][y].block != null)
                        {
                            let newX = x;
                            let needMove = false;
                            while(true) {

                                if (newX == this.dimension - 1)
                                {
                                    break;
                                }
                                
                                if (this.mCells[newX + 1][y].block == null)
                                {
                                    needMove = true;
                                }
                                else if (this.mCells[x][y].value == this.mCells[newX + 1][y].value)
                                {
                                    needMove = true;
                                    ++newX;
                                    break;
                                }
                                else
                                {
                                    break;
                                }
                                ++newX;
                            }

                            if (needMove)
                            {
                                this.moveBlock(x, y, newX, y);
                            }
                        }
                    }
                }
                break;
            }
            case eTouchMoveDirection.Left: {

                for (let y = 0; y < this.dimension; ++y)
                {
                    for (let x = 0; x < this.dimension; ++x)
                    {
                        if (this.mCells[x][y].block != null)
                        {
                            let newX = x;
                            let needMove = false;
                            while(true) {

                                if (newX == 0)
                                {
                                    break;
                                }
                                
                                if (this.mCells[newX - 1][y].block == null)
                                {
                                    needMove = true;
                                }
                                else if (this.mCells[x][y].value == this.mCells[newX - 1][y].value)
                                {
                                    needMove = true;
                                    --newX;
                                    break;
                                }
                                else
                                {
                                    break;
                                }
                                --newX;
                            }

                            if (needMove)
                            {
                                this.moveBlock(x, y, newX, y);
                            }
                        }
                    }
                }
                break;
            }
            case eTouchMoveDirection.Up: {

                for (let x = 0; x < this.dimension; ++x)
                {
                    for (let y = this.dimension - 1; y >= 0; --y)
                    {
                        if (this.mCells[x][y].block != null)
                        {
                            let newY = y;
                            let needMove = false;
                            while(true) {

                                if (newY == this.dimension - 1)
                                {
                                    break;
                                }
                                
                                if (this.mCells[x][newY + 1].block == null)
                                {
                                    needMove = true;
                                }
                                else if (this.mCells[x][y].value == this.mCells[x][newY + 1].value)
                                {
                                    needMove = true;
                                    ++newY;
                                    break;
                                }
                                else
                                {
                                    break;
                                }
                                ++newY;
                            }

                            if (needMove)
                            {
                                this.moveBlock(x, y, x, newY);
                            }
                        }
                    }
                }
                break;
            }
            case eTouchMoveDirection.Down: {

                for (let x = 0; x < this.dimension; ++x)
                {
                    for (let y = 0; y < this.dimension; ++y)
                    {
                        if (this.mCells[x][y].block != null)
                        {
                            let newY = y;
                            let needMove = false;
                            while(true) {

                                if (newY == 0)
                                {
                                    break;
                                }
                                
                                if (this.mCells[x][newY - 1].block == null)
                                {
                                    needMove = true;
                                }
                                else if (this.mCells[x][y].value == this.mCells[x][newY - 1].value)
                                {
                                    needMove = true;
                                    --newY;
                                    break;
                                }
                                else
                                {
                                    break;
                                }
                                --newY;
                            }

                            if (needMove)
                            {
                                this.moveBlock(x, y, x, newY);
                            }
                        }
                    }
                }
                break;
            }
        }
    }

    moveBlock(oldX: number, oldY: number, newX: number, newY: number) {

        if ((this.mCells[newX][newY].block != null))
        {
            this.mCells[newX][newY].value = this.mCells[newX][newY].value * 2;
            let nodeToDelete = this.mCells[newX][newY].block;

            cc.tween(this.node)
                .delay(this.moveBlockTime)
                .call(() => { nodeToDelete.destroy(); })
                .start();
        }
        else
        {
            this.mCells[newX][newY].value = this.mCells[oldX][oldY].value;
        }

        this.mCells[newX][newY].block = this.mCells[oldX][oldY].block;
        this.mCells[newX][newY].block.children[0].getComponent(cc.Label).string = this.mCells[newX][newY].value.toString();
        this.mCells[oldX][oldY].block = null;
        let newPosition = this.getBlockPositionByCellNumber(Helper.GetCellNumberByCellCoordinates(newX, newY, this.dimension));
        cc.tween(this.mCells[newX][newY].block).to(this.moveBlockTime, {x: newPosition.x, y: newPosition.y}).start();

        this.wasAnyMove = true;
    }

    // update (dt) {}

    restartGame() {

        var CellNumber1 = Helper.RandomIntInRange(0, Math.pow(this.dimension, 2) - 1);
        var CellNumber2 = CellNumber1;
        do {
            CellNumber2 = Helper.RandomIntInRange(0, Math.pow(this.dimension, 2) - 1);
        } while(CellNumber2 == CellNumber1);

        this.spawnBlockAtCell(CellNumber1);
        this.spawnBlockAtCell(CellNumber2);
    }

    spawnBlockAtCell(cellNumber: number, value?: number) {

        let block = new cc.Node;
        block.parent = this.node;
        block.scale = 0;
        cc.tween(block).to(0.3, {scale: 1}).start();
        block.setPosition(this.getBlockPositionByCellNumber(cellNumber));
        let graphicsComponent = block.addComponent(cc.Graphics);
        graphicsComponent.fillColor = new cc.Color(255, 0, 0, 255);
        graphicsComponent.roundRect(-0.5 * this.mBlockSize, -0.5 * this.mBlockSize, this.mBlockSize, this.mBlockSize, this.gameFieldArcRadius);
        graphicsComponent.fillRect();

        let textNode = new cc.Node;
        textNode.parent = block;
        let labelComponent = textNode.addComponent(cc.Label);

        if (!value) {

            value = (Math.random() < 0.5) ? 2 : 4;
        }

        labelComponent.string = value.toString();

        let coords = Helper.GetCellCoordinateByCellNumber(cellNumber, this.dimension);
        this.mCells[coords.x][coords.y].block = block;
        this.mCells[coords.x][coords.y].value = value;
    }

    getBlockPositionByCellNumber(cellNumber: number) {
        
        let coords = Helper.GetCellCoordinateByCellNumber(cellNumber, this.dimension);
        return new cc.Vec2((coords.x + 1) * this.mSpan + (coords.x + 0.5) * this.mBlockSize - this.mGameFieldSize * 0.5,
                            (coords.y + 1) * this.mSpan + (coords.y + 0.5) * this.mBlockSize - this.mGameFieldSize * 0.5);
    }
}
