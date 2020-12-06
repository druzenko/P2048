const {ccclass, property} = cc._decorator;

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
}
