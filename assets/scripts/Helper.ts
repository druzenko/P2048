const {ccclass, property} = cc._decorator;

import * as GameField from "./GameField";
import CryptoJS = require("crypto-js");
import Scores from "./Scores"

let encryptKey = "Vitalier1";

let gLastFieldsStack = new Map<number, Array<[Array<number>, number/*, number*/]>>();

let gMaxStackNumber: number = 100;

let gPreviousGameField: [Array<number>, number/*, number*/] = null;

@ccclass
export default class Helper {

    //returns random integer number in range between 'begin' and 'end' including both 
    public static RandomIntInRange(begin: number, end: number) {

        return Math.round(begin + Math.random() * (end - begin));
    }

    public static GetCellCoordinateByCellNumber(cellNumber: number, dimension: number) {

        return new cc.Vec2(Math.floor(cellNumber % dimension), Math.floor(cellNumber / dimension));
    }

    public static GetCellNumberByCellCoordinates(x: number, y: number, dimension: number) {

        return y * dimension + x;
    }

    public static ResetLastFieldsStack(dimension: number) {

        if (gLastFieldsStack.has(dimension)) {

            gLastFieldsStack.delete(dimension);
        }
    }

    public static PopLastField(dimension: number): [Array<number>, number/*, number*/] {

        let lastField: [Array<number>, number/*, number*/] = null;
        let stack = gLastFieldsStack.get(dimension);
        if (stack && stack.length > 0) {

            lastField = stack[stack.length - 1];
            stack.splice(stack.length - 1, 1);
        }
        
        return lastField;
    }

    public static ClearPreviousGameField(): void {

        gPreviousGameField = null;
    }

    public static saveProperty(key: string, value: string) {

        let encryptedKey = CryptoJS.AES.encrypt(key, encryptKey);
        let encryptedValue = CryptoJS.AES.encrypt(value, encryptKey);
        cc.sys.localStorage.setItem(encryptedKey.toString(), encryptedValue.toString());
    }

    public static loadProperty(key: string): string {

        let encryptedKey = CryptoJS.AES.encrypt(key, encryptKey);
        let encrypted = cc.sys.localStorage.getItem(encryptedKey.toString());
        if (encrypted != null) {

            let decrypted = CryptoJS.AES.decrypt(encrypted, encryptKey);
            return decrypted.toString(CryptoJS.enc.Utf8);
        }

        return null;
    }

    public static saveGame(cells: Array<Array<GameField.CellInfo>>, dimension: number) {

        let save: Array<number> = [];

        for (let x = 0; x < dimension; ++x) {

            for (let y = 0; y < dimension; ++y) {

                if (cells[x][y].block != null) {

                    save.push(x);
                    save.push(y);
                    save.push(cells[x][y].value);
                }
            }
        }

        this.saveProperty("field" + dimension.toString(), JSON.stringify(save));

        if (gPreviousGameField) {

            let stack = gLastFieldsStack.get(dimension);

            if (stack == null) {

                stack = new Array<[Array<number>, number/*, number*/]>();
                gLastFieldsStack.set(dimension, stack);
            }

            if (stack.length >= gMaxStackNumber) {

                stack.splice(0, 1);
            }

            stack.push(gPreviousGameField);
        }

        gPreviousGameField = null;
        gPreviousGameField = [null, 0/*, 0*/];

        gPreviousGameField[0] = save;
        gPreviousGameField[1] = Scores.getCurrentScore();
        //gPreviousGameField[2] = Scores.getBestScore();
    }

    public static loadGame(dimension: number): string {

        return this.loadProperty("field" + dimension.toString());
    }

    public static saveScore(score: number, dimension: number, bestScore: boolean): void {

        let key = (bestScore) ? "BestScore" : "Score";
        this.saveProperty(key + dimension.toString(), score.toString());
    }

    public static loadScore(dimension: number, bestScore: boolean): number {

        let key = (bestScore) ? "BestScore" : "Score";
        let score = this.loadProperty(key + dimension.toString());
        if (score != null) {
            
            return parseInt(score);
        }

        return 0;
    }
}
