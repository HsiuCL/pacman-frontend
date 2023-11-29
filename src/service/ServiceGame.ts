import { EFourDir, TBoard } from "components/Game";
import { APIGame } from "./API/APIGame";
import { RetCode } from "utils/RetCode/RetCode";
import { asyncFailWrap } from "utils/error/errorTool";

export class ServiceGame {
    @asyncFailWrap
    public static async postInitialize(level: number, pacman_speed: number,
        ghost_number: number, ghost_speed: number, life: number): Promise<RetCode<TBoard>> {
        return APIGame.getInstance().postInitialize(level, pacman_speed, ghost_number, ghost_speed, life);
    }

    @asyncFailWrap
    public static async postUpdate(): Promise<RetCode<TBoard>> {
        return APIGame.getInstance().postUpdate();
    }

    public static async postDirection(dir: EFourDir) {
        return APIGame.getInstance().postDirection(dir);
    }

    public static async postFruit() {
        return APIGame.getInstance().postFruit();
    }
}