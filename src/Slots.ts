import * as PIXI from "pixi.js";
import Reel from "./Reel";
import Tile from "./Tile";

export default class Slots extends PIXI.Container {
    reelLength: number;
    bgr: PIXI.Graphics;
    mask: PIXI.Graphics;
    reels: Reel[];
    tiles: Array< Promise<any>|Tile[] >;

    constructor(){
        super();

        const xStep = 100;
        const yStep = 100;
        const reelsNumber = 3;
        const visibleRows = 3;
        const totalW = xStep * reelsNumber;
        const totalH = yStep * visibleRows;
        const reelTilesQuantity =
            this.reelLength = 5;

        this.pivot.y = (visibleRows*0.5 - 0.5) * yStep;

        this.bgr =
            this.addChild(new PIXI.Graphics()
            .beginFill(255, 0.5)
            .drawRect(-totalW/2, -0.5*yStep, totalW, totalH));

        this.mask =
            this.addChild(this.bgr.clone());

        this.reels = [
            this.addChild( new Reel([], yStep)),
            this.addChild( new Reel([], yStep)),
            this.addChild( new Reel([], yStep)),
        ];

        this.reels.forEach( (reel, ir) => {
            reel.position.x = (ir - (0.5 * reelsNumber - 0.5)) * xStep;
            const tilesQuantity = Math.max(reelTilesQuantity, visibleRows);

            for (let i=0; i<tilesQuantity; i++) {
                reel.addTile(new Tile(undefined));
            }

        })

    }

    rollByTiles ( deltaPositions: number[] ) {
        this.tiles = [];

        this.reels.forEach((reel, i)=>{
            const roll = reel.rollBy(deltaPositions[i] || 0);

            this.tiles.push(roll);

        });
        // this.emit("startReels", this);

        return Promise.all(this.tiles)
            // .then(this.onRollsComplete);
    }

    onRollsComplete = (results: Tile[][]) => {
        console.log(
            results[0][0].typeId,
            results[1][0].typeId,
            results[2][0].typeId
        );
        console.log(this);
        // this.emit("stopReels", results);
        return results;
    };

    stopNow () {
        this.reels.forEach(r=>r.interrupt());
    }
}