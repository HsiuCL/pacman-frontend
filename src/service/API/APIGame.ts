import { apiPOST } from "utils/API/APITool";
import APIBase from "./APIBase";
import { RefCallback } from "react";
import { RetCode } from "utils/RetCode/RetCode";
import { EFourDir, TBoard } from "components/Game";

module APIGame {
    export type postInitializeRequest = {
        level: number,
        pacman_speed: number,
        ghost_number: number,
        ghost_speed: number,
        life: number
    }

    export type postInitializeResponse = {
        Board: TBoard
    }

    export type postUpdateResponse = {
        Board: TBoard
    }

    export type postDirectionRequest = {
        direction: EFourDir
    }

    export type postDirectionResponse = {
        result: string
    }

    export type postFruitResponse = {
        result: string
    }
}

export class APIGame extends APIBase {
    public static _instance: APIGame;

    public static getInstance() {
        if (!APIGame._instance) {
            APIGame._instance = new APIGame();
        }
        return APIGame._instance;
    }

    protected constructor(URL?: string) {
        super(URL ?? process.env.REACT_APP_BACKEND_API);
    }

    public async postInitialize(level: number, pacman_speed: number, ghost_number: number, ghost_speed: number, life: number): Promise<RetCode<TBoard>> {
        const req: APIGame.postInitializeRequest = {
            level: level,
            pacman_speed: pacman_speed,
            ghost_number: ghost_number,
            ghost_speed: ghost_speed,
            life: life
        }
        return apiPOST<TBoard>(
            this.getURL(),
            "/initialize",
            req
        );
    }
    
    public async postUpdate(): Promise<RetCode<TBoard>> {
        return apiPOST<TBoard>(
            this.getURL(),
            "/update"
        );
    }

    public async postDirection(direction: EFourDir): Promise<RetCode<APIGame.postDirectionResponse>> {
        const req: APIGame.postDirectionRequest = {
            direction: direction
        }
        return apiPOST<APIGame.postDirectionResponse>(
            this.getURL(),
            "/direction",
            req
        );
    }

    public async postFruit(): Promise<RetCode<APIGame.postFruitResponse>> {
        return apiPOST<APIGame.postFruitResponse>(
            this.getURL(),
            "/fruit"
        );
    }
}