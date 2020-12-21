const {ccclass, property} = cc._decorator;

import * as GameField from "./GameField";
//import EncryptJS from "./encryptjs";
//var EncryptJS = require("encryptjs");
import CryptoJS = require("crypto-js");

let encryptKey = "Vitalier";

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

    public static saveGame(cells: Array<Array<GameField.CellInfo>>, dimension: number) {

        let save = [];

        for (let x = 0; x < dimension; ++x) {

            for (let y = 0; y < dimension; ++y) {

                if (cells[x][y].block != null) {

                    save.push(x);
                    save.push(y);
                    save.push(cells[x][y].value);
                }
            }
        }

        let encrypted = CryptoJS.AES.encrypt(JSON.stringify(save), encryptKey);
        cc.sys.localStorage.setItem("field" + dimension.toString(), encrypted.toString());
    }

    public static loadGame(dimension: number): string {

        let encrypted = cc.sys.localStorage.getItem("field" + dimension.toString());

        if (encrypted != null && encrypted.length > 0) {

            let decrypted = CryptoJS.AES.decrypt(encrypted, encryptKey);
            return decrypted.toString(CryptoJS.enc.Utf8);
        }

        return null;
    }

    public static saveScore(score: number, dimension: number, bestScore: boolean): void {

        let key = (bestScore) ? "BestScore" : "Score";
        let encrypted = CryptoJS.AES.encrypt(score.toString(), encryptKey);
        cc.sys.localStorage.setItem(key + dimension.toString(), encrypted.toString());
    }

    public static loadScore(dimension: number, bestScore: boolean): number {

        let key = (bestScore) ? "BestScore" : "Score";
        let encrypted = cc.sys.localStorage.getItem(key + dimension.toString());
        if (encrypted != null) {

            let decrypted = CryptoJS.AES.decrypt(encrypted, encryptKey);
            return parseInt(decrypted.toString(CryptoJS.enc.Utf8));
        }

        return 0;
    }
}
