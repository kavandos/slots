import * as PIXI from "pixi.js";


export default class Tile extends PIXI.Container {
    bgr: PIXI.DisplayObject;
    title: PIXI.Text;
    typeId: number;
    reelPosition: number|null;

    constructor( typeId: number|undefined ){
        super();

        if (typeId === undefined) {
            typeId = Math.floor( Math.random() * Tile.TYPES.length );
        }

        this.bgr = this.addChild( Tile.TYPES[typeId].clone() );

        this.title = this.addChild(new PIXI.Text(typeId.toString(), {
            fontSize:36,
            fontFamily:"Arial",
            fill:"white",
        }));
        this.title.anchor.set(0.5);

        this.typeId = typeId;
        this.reelPosition = null;
    }

    // static copy(tile: Tile):Tile {
    //     return new Tile( tile.typeId );
    // }

    static TYPES = [
        new PIXI.Graphics().beginFill(0xff0055).drawRect(-40, -40, 80, 80),
        new PIXI.Graphics().beginFill(0x55ff00).drawRoundedRect(-42, -42, 84, 84, 20),
        new PIXI.Graphics().beginFill(0x0055ff).drawCircle(0, 0, 45)
    ];
}