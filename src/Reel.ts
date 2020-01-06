import * as PIXI from "pixi.js";
//@ts-ignore
import TWEEN from "@tweenjs/tween.js";
import Tile from "./Tile";

export default class Reel extends PIXI.Container {
    tiles: Tile[];
    rowsStep: number;
    //@ts-ignore
    rollTween: TWEEN.Tween;
    private _rollPosition: number;
    readonly _rollSpeed: number;
    readonly _rollBackDistance: number;

    constructor (tiles: Tile[]|undefined|null, rowsStep: number) {
        super();

        this.tiles = tiles || [];
        this.rowsStep = 100 || rowsStep;
        this._rollPosition = 0;

        this.rollTween = null;
        this._rollSpeed = 0.0106;
        this._rollBackDistance = 0.66;
    }

    addTile (tile: Tile) {
        this.addChild(tile);
        this.tiles.push(tile);
        this.alignTiles();
    }

    alignTiles = () => this.tiles.forEach(this.alignTile);

    alignTile = (tile: Tile, i: number) => {
        tile.reelPosition = i + this._rollPosition;
        const tileReelPos = (1 + tile.reelPosition) % (this.tiles.length) - 1;
        tile.y = tileReelPos * this.rowsStep;
    };

    sortTiles () {
        const length = this.tiles.length;
        this.tiles.sort((a, b) => a.reelPosition%length - b.reelPosition%length );
        this.tiles.forEach((tile, i) => tile.reelPosition = i);
        this._rollPosition = 0;
    }

    rollBy (tilesNum: number) : Promise<Tile[]> {
        const duration = tilesNum / this._rollSpeed;
        const finishDuration = 10 * this._rollBackDistance / this._rollSpeed;
        const rollDestination = this._rollPosition + tilesNum;
        const rollBackDestination = rollDestination + this._rollBackDistance;

        return new Promise((resolve)=>{

            const rollTw = new TWEEN.Tween(this)
                .to({_rollPosition: rollDestination}, duration)
                .onUpdate(this.alignTiles)
                .onStop( ()=> {
                    this.onStopRoll();
                    resolve();
                } )
                .onComplete(this.rollTweenReset)
                .onStart(this.startRolling);

            const slowTw = new TWEEN.Tween(this)
                .to({_rollPosition: rollBackDestination}, 0.2*finishDuration)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(this.alignTiles);

            const stopTw = new TWEEN.Tween(this)
                .to({_rollPosition: rollDestination}, 0.8*finishDuration)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(this.alignTiles)
                //
                .onComplete(resolve);

            rollTw.chain(slowTw);
            slowTw.chain(stopTw);
            rollTw.start();

            this.rollTween = rollTw;


        }).then(this.completeRolling);
    }

    onStopRoll = () => {
        const duration = 5 * 0.7 * this._rollBackDistance / this._rollSpeed;
        const toPosition = Math.floor(this._rollPosition);
        return new TWEEN.Tween(this)
            .to({_rollPosition: toPosition}, duration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(this.alignTiles)
            .onComplete(this.completeRolling)
            .start();
    };

    interrupt () {
        if (this.rollTween) {
            this.rollTween.stop();
            this.rollTween.stopChainedTweens();
        }
    }

    startRolling = () => {
        console.log("start roll");
        this.emit("rollStart", this);

    };

    rollTweenReset = () => {
        this.rollTween = null;
    };

    completeRolling = () => {
        console.log("complete roll");
        this.rollTween = null;
        this.sortTiles();
        this.emit("rollComplete", this);
        return this.tiles;
    }

}