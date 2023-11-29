import { useEffect, useRef, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import RangeSlider from 'react-bootstrap-range-slider';
import { Link } from "react-router-dom";
import { Sprite, SpriteXStrategy, TFourDirSprite } from "../utils/Canvas/Sprite";
import { updateStateOnValChange } from "../utils/lib/React/stateHook";
import { ServiceGame } from "service/ServiceGame";
import { logErr } from "utils/error/ErrorTool";

enum EItem {
    movable = 0,
    wall = 1,
    ghost = 2,
    smallDot = 3,
    bigDot = 4,
    fruit = 5,
    chefhat = 6
};

export enum EFourDir {
    left = 2,
    right = 0,
    up = 1,
    down = 3
}

enum EGhostColor {
    red = 'red',
    pink = 'pink',
    blue = 'blue',
    orange = 'orange'
}


type TACharacter = {
    loc: {
        x: number,
        y: number
    },
    vel: {
        x: number,
        y: number
    },
    direction: EFourDir
}

type TGhost = TACharacter & {
    color: EGhostColor,
    isFlashing: boolean
}

type TPacman = TACharacter & {
    life: number
};

type TGameSprite = {
    pacman: TFourDirSprite,
    ghost: Record<EGhostColor, TFourDirSprite>,
    flashingGhost: {
        blue: Sprite,
        white: Sprite 
    }
}

type TGameSettings = {
    level: number,
    pacmanSpeed: number,
    ghostSpeed: number,
    ghostNumber: number,
    life: number
}

export type TBoard = {
    score: number,
    ghostList: TGhost[],
    pacman: TPacman,
    grid: EItem[][],
    ghostEaten: number
}

const Game = () => {
    const mapSrc = "img/map.png";
    const gridSize = 20;
    const drawSize = 16;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [board, setBoard] = useState<TBoard>();
    const gameSpriteRef = useRef<TGameSprite>();
    const [bigDotOn, setBigDotOn] = useState<boolean>(true);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [settings, setSettings] = useState<TGameSettings>({
        level: 1,
        ghostSpeed: 1,
        pacmanSpeed: 1,
        ghostNumber: 2,
        life: 3
    })
    const [tmpSettings, setTmpSettings] = useState<TGameSettings>();
    const [loading, setLoading] = useState<boolean>(true);

    const canvasWidth = 800;
    const canvasHeight = 400;

    const gameIntervalRef = useRef<NodeJS.Timer[]>([]);
    const [showGameOver, setShowGameOver] = useState<boolean>(false);
    const updateCounterRef = useRef<number>(0);

    useEffect(() => {
        setSprite();

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, [])

    const startGame = async () => {
        setTmpSettings(settings);
        await initializeGame();
        startGameInterval();
        setLoading(false);
    }

    useEffect(() => {
        startGame();
    }, [settings]);

    const noDots = (grid?: EItem[][]) => {
        if (!grid) {
            return false;
        }
        let count = 0;
        grid.forEach(row => {
            row.forEach(item => {
                if (item === EItem.smallDot || item === EItem.bigDot) {
                    count++;
                }
            })
        })

        return count === 0;
    }

    useEffect(() => {
        if (board?.pacman?.life === 0 || noDots(board?.grid)) {
            pauseGameInterval();
            setShowGameOver(true)
        }
    }, [board]);

    useEffect(() => {
        const context = canvasRef.current?.getContext("2d");
        context?.clearRect(0, 0, canvasWidth, canvasHeight);
        if (!context) {
            return;
        }
        drawPacman(context);
        drawGhosts(context);
    }, [board]);

    const handleKeyDown = (event: KeyboardEvent) => {
        const keyToDir: Record<string, EFourDir> = {
            ArrowUp: EFourDir.up,
            ArrowDown: EFourDir.down,
            ArrowLeft: EFourDir.left,
            ArrowRight: EFourDir.right,
        }
        if (event.key in keyToDir) {
            ServiceGame.postDirection(keyToDir[event.key]);
        }
    }

    const initializeGame = async () => {
        try {
            const curBoard = (await ServiceGame.postInitialize(settings.level, settings.pacmanSpeed,
                settings.ghostNumber, settings.ghostSpeed, settings.life)).safeGetObj()
            setBoard(curBoard);
        } catch (error) {
            logErr(error);
        }
    }

    const setSprite = () => {
        const img = new Image();
        img.src = "img/sprite.png";
        const size = 16;
        gameSpriteRef.current = {
            pacman: {
                [EFourDir.right]: new Sprite(img, size, size, drawSize, drawSize, 0, 0, 2, SpriteXStrategy),
                [EFourDir.left]: new Sprite(img, size, size, drawSize, drawSize, 0, size, 2, SpriteXStrategy),
                [EFourDir.up]: new Sprite(img, size, size, drawSize, drawSize, 0, 2*size, 2, SpriteXStrategy),
                [EFourDir.down]: new Sprite(img, size, size, drawSize, drawSize, 0, 3*size, 2, SpriteXStrategy)
            },
            ghost: {
                [EGhostColor.red]: {
                    [EFourDir.right]: new Sprite(img, size, size, drawSize, drawSize, 2, 4*size, 2, SpriteXStrategy),
                    [EFourDir.left]: new Sprite(img, size, size, drawSize, drawSize, 2*size+2, 4*size, 2, SpriteXStrategy),
                    [EFourDir.up]: new Sprite(img, size, size, drawSize, drawSize, 4*size+2, 4*size, 2, SpriteXStrategy),
                    [EFourDir.down]: new Sprite(img, size, size, drawSize, drawSize, 6*size+2, 4*size, 2, SpriteXStrategy)
                },
                [EGhostColor.pink]: {
                    [EFourDir.right]: new Sprite(img, size, size, drawSize, drawSize, 2, 5*size, 2, SpriteXStrategy),
                    [EFourDir.left]: new Sprite(img, size, size, drawSize, drawSize, 2*size+2, 5*size, 2, SpriteXStrategy),
                    [EFourDir.up]: new Sprite(img, size, size, drawSize, drawSize, 4*size+2, 5*size, 2, SpriteXStrategy),
                    [EFourDir.down]: new Sprite(img, size, size, drawSize, drawSize, 6*size+2, 5*size, 2, SpriteXStrategy)
                },
                [EGhostColor.blue]: {
                    [EFourDir.right]: new Sprite(img, size, size, drawSize, drawSize, 2, 6*size, 2, SpriteXStrategy),
                    [EFourDir.left]: new Sprite(img, size, size, drawSize, drawSize, 2*size+2, 6*size, 2, SpriteXStrategy),
                    [EFourDir.up]: new Sprite(img, size, size, drawSize, drawSize, 4*size+2, 6*size, 2, SpriteXStrategy),
                    [EFourDir.down]: new Sprite(img, size, size, drawSize, drawSize, 6*size+2, 6*size, 2, SpriteXStrategy)
                },
                [EGhostColor.orange]: {
                    [EFourDir.right]: new Sprite(img, size, size, drawSize, drawSize, 2, 7*size, 2, SpriteXStrategy),
                    [EFourDir.left]: new Sprite(img, size, size, drawSize, drawSize, 2*size+2, 7*size, 2, SpriteXStrategy),
                    [EFourDir.up]: new Sprite(img, size, size, drawSize, drawSize, 4*size+2, 7*size, 2, SpriteXStrategy),
                    [EFourDir.down]: new Sprite(img, size, size, drawSize, drawSize, 6*size+2, 7*size, 2, SpriteXStrategy)
                }
            },
            flashingGhost: {
                "blue": new Sprite(img, size, size, drawSize, drawSize, 8*size+2, 4*size, 2, SpriteXStrategy),
                "white": new Sprite(img, size, size, drawSize, drawSize, 10*size+2, 4*size, 2, SpriteXStrategy),
            }
        }
    }

    const drawPacman = (context: CanvasRenderingContext2D) => {
        if (!board || !board.pacman) {
            return;
        }

        gameSpriteRef.current?.pacman[board.pacman.direction].draw(context, board.pacman.loc.x - drawSize / 2, board.pacman.loc.y - drawSize / 2);
    }

    const drawGhosts = (context: CanvasRenderingContext2D) => {
        if (!board || !board.ghostList) {
            return;
        }

        board.ghostList.forEach((ghost, idx) => {
            if (!ghost) {
                return;
            }
            if (ghost.isFlashing) {
                if (bigDotOn) {
                    gameSpriteRef.current?.flashingGhost["blue"].draw(context, ghost.loc.x - drawSize / 2, ghost.loc.y - drawSize / 2);
                } else {
                    gameSpriteRef.current?.flashingGhost["white"].draw(context, ghost.loc.x - drawSize / 2, ghost.loc.y - drawSize / 2);
                }
            } else {
                gameSpriteRef.current?.ghost[ghost.color][ghost.direction].draw(context, ghost.loc.x - drawSize / 2, ghost.loc.y - drawSize / 2);
            }
        });
    }

    const updatePosition = async () => {
        try {
            const curBoard = (await ServiceGame.postUpdate()).safeGetObj();
            updateCounterRef.current = (updateCounterRef.current + 1) % 100;
            if (updateCounterRef.current === 0) {
                ServiceGame.postFruit();
            }
            if (updateCounterRef.current % 5 == 0) {
                updateFrame(curBoard);
            }
            setBoard(curBoard);
        } catch (error) {
            logErr(error);
        }
   }

    const updateFrame = (board: TBoard) => {

        if (!board || !board.pacman) {
            return;
        }
        if (board.pacman?.vel.x !== 0 || board.pacman?.vel.y !== 0) {
            gameSpriteRef.current?.pacman[board.pacman.direction].updateFrame();
        }
        board.ghostList.forEach((ghost, idx) => {
            gameSpriteRef.current?.ghost[ghost.color][ghost.direction].updateFrame();
        });
    }

    const toggleBigDotOn = () => {
        setBigDotOn(prevData => !prevData);
    }

    const startGameInterval = () => {
        if (gameIntervalRef.current.length !== 0) {
            return;
        }

        gameIntervalRef.current.push(setInterval(() => {
            updatePosition();
        }, 100))

        gameIntervalRef.current.push(setInterval(() => {
            toggleBigDotOn();
        }, 200));

        /*
        gameIntervalRef.current.push(setInterval(() => {
            updateFrame();
        }, 500));
        */
    }

    const pauseGameInterval = () => {
        try {
            gameIntervalRef.current.forEach(timer => {
                clearInterval(timer);
            })
            gameIntervalRef.current = [];
        } catch (error) {
            logErr(error);
        }
    }


    const getElementFromEItem = (itemName: EItem, key: number): JSX.Element => {
        switch (itemName) {
            case EItem.smallDot:
                return (
                    <div className="position-relative d-flex flex-column justify-content-center align-items-center" key={key} style={{ width: "20px", height: "20px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="6px" height="6px" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" /></svg>
                    </div>
                );
            
            case EItem.bigDot:
                return (
                    <div className="position-relative d-flex flex-column justify-content-center align-items-center" key={key} style={{ width: "20px", height: "20px" }}>
                        {
                            bigDotOn &&
                            <svg xmlns="http://www.w3.org/2000/svg" width="10px" height="10px" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z" /></svg>
                        }
                    </div>
                );
            
            case EItem.fruit:
                return (
                    <div className="position-relative d-flex flex-column justify-content-center align-items-center" key={key} style={{ width: "20px", height: "20px" }}>
                        <img height={"20px"} src="img/fruit.png" alt="Oops.."/>
                    </div>
                )

            case EItem.chefhat:
                return (
                    <div className="position-relative d-flex flex-column justify-content-center align-items-center" key={key} style={{ width: "20px", height: "20px" }}>
                        <img height={"20px"} src="img/chefhat.png" alt="Oops.."/>
                    </div>
                )

            default:
                return(
                    <div className="" key={key} style={{ width: "20px", height: "20px" }}></div>
                );
        }
    }

    const closeSettings = () => {
        setShowSettings(false);
        startGameInterval();
    }

    const saveSettings = () => {
        if (JSON.stringify(tmpSettings) !== JSON.stringify(settings)) {
            setLoading(true);
            setSettings(tmpSettings ?? settings);
        } else {
            startGameInterval();
        }
        setShowSettings(false);
    }

    const handleRestartGame = () => {
        setShowGameOver(false);
        startGame();
    }

    return (
        <div className="d-flex flex-column justify-content-center" style={{minHeight: "100vh"}}>
            {   showGameOver &&
            <div id="game-over-container" className="position-absolute top-0 start-0" style={{width: "100vw", height: "100vh", zIndex: "1024"}} onScroll={(event) => event.preventDefault()}>
                <div id="new-post-bg-mask" className="w-100 h-100 position-absolute top-0 start-0 blur" />
                <div id="new-post" className="new-post position-absolute top-50 start-50 translate-middle rounded" style={{backgroundColor: "rgb(30, 30, 50)"}}>
                    <div className="card d-flex flex-column w-100 h-100 p-3 bg-transparant">
                        <div>
                            <div className="display-6">Game Over</div>
                            <p className="display-6">Final Score</p>
                            <p>{board?.score}</p>
                        </div>
                        <button className="btn btn-success" onClick={handleRestartGame}>Restart</button>
                    </div>
                </div>
            </div>
            }

            {   loading ?
                <div>Loading...</div> :
                <>
                    <Modal show={showSettings} onHide={closeSettings}>
                        <Modal.Header closeButton>
                            <Modal.Title>Game Settings</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="d-flex flex-column gap-4">
                            <div className="w-100">
                                <label className="fs-3" htmlFor="level">Level</label><br/>
                                <select className="form-select" name="level" id="level" value={tmpSettings?.level} onChange={updateStateOnValChange(setTmpSettings, "level")}>
                                    <option value="1">Level 1</option>
                                    <option value="2">Level 2</option>
                                </select>
                            </div>

                            <div>
                                <label className="fs-3" htmlFor="ghostNumber">Ghost Number</label><br/>
                                <RangeSlider
                                    value={tmpSettings?.ghostNumber ?? 1}
                                    min={2}
                                    max={4}
                                    step={1}
                                    tooltip="off"
                                    onChange={updateStateOnValChange(setTmpSettings, "ghostNumber")}
                                    className="w-50"
                                    />
                                <span className="ms-2">{tmpSettings?.ghostNumber}</span>
                            </div>

                            <div>
                                <label className="fs-3" htmlFor="ghostSpeed">Ghost Speed</label><br/>
                                <RangeSlider
                                    value={tmpSettings?.ghostSpeed ?? 1}
                                    min={1}
                                    max={10}
                                    tooltip="off"
                                    onChange={updateStateOnValChange(setTmpSettings, "ghostSpeed")}
                                    className="w-50"
                                    />
                                <span className="ms-2">{tmpSettings?.ghostSpeed}</span><br/>
                            </div>

                            <div>
                                <label className="fs-3" htmlFor="life">Life Number</label><br/>
                                <RangeSlider
                                    value={tmpSettings?.life ?? 1}
                                    min={1}
                                    max={10}
                                    step={1}
                                    tooltip="off"
                                    onChange={updateStateOnValChange(setTmpSettings, "life")}
                                    className="w-50"
                                    />
                                <span className="ms-2">{tmpSettings?.life}</span><br/>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Link to={"/specialThanks"} className="position-absolute start-0 ms-3">Special Thanks</Link>
                            <Button variant="secondary" onClick={closeSettings}>
                            Close
                            </Button>
                            <Button variant="primary" onClick={saveSettings}>
                            Save
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <div className="d-flex flex-column align-items-center">
                        <div className="top-bar d-flex flex-row gap-2 my-4 font-weight-bold justify-content-between" style={{width: "760px"}}>
                            <div className="start-box d-flex flex-column gap-2">
                                <div className="display-6 align-self-start text-start">Chefman</div>
                                <span className="score font-weight-bold text-start fs-5">Score: { board?.score }</span>
                            </div>
                            <div className="end-box">
                                <button className="btn btn-no-border" onClick={() => {pauseGameInterval(); setShowSettings(true)}} style={{color: "#ff0000"}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="40px" width="40px" viewBox="0 0 320 512" style={{fill: "white"}}><path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>
                                </button>
                            </div>
                        </div>
                        <div className="position-relative" style={{}}>
                            <canvas id="canvas" className="position-absolute t-0 s-0" width={`${canvasWidth}px`} height={`${canvasHeight}px`} style={{top: "0", left: "0", zIndex: "999"}} ref={canvasRef}/>
                            <div className="board-objects" style={{backgroundImage: `url(img/map-level-${settings.level}.png)`}}>
                                <div className="board d-flex flex-column" >
                                    {   board?.grid?.map((rowArr, row) => (
                                        <div className="d-flex flex-row" key={row}>
                                            {   rowArr.map((item, col) => (
                                                    getElementFromEItem(item, col)
                                                ))
                                            }
                                        </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="bottom-bar d-flex justify-content-between" style={{width: "760px"}}>
                            <div className="life-box align-self-start">
                                {   board && Array.from({length: board?.pacman?.life}, (_, idx) => (
                                    <img src="img/life.png" alt="Oops.." key={idx}/>
                                ))}
                            </div>
                            <span>{ `LEVEL ${settings.level}` }</span>
                        </div>
                    </div>
                </>
            }
        </div>
    );
}
 
export default Game;