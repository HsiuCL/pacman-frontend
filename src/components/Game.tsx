import { useEffect, useRef, useState } from "react";
import { EFourDirSprite, Sprite, SpriteXStrategy, TFourDirSprite } from "../utils/Canvas/Sprite";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import RangeSlider from 'react-bootstrap-range-slider';
import { updateStateOnValChange } from "../utils/Lilb/React/stateHook";
import { logErr } from "../utils/Error/ErrorTool";
import { Link } from "react-router-dom";

enum EItem {
    movable = 0,
    wall = 1,
    ghost = 2,
    smallDot = 3,
    bigDot = 4,
    fruit = 5
};

enum EGhostColor {
    red = 'red',
    pink = 'pink',
    blue = 'blue',
    orange = 'orange'
}

enum EGhostState {
    normal = 'normal',
    fleeing = 'fleeing',
    flashing = 'flashing'
}

type TACharacter = {
    location: {
        x: number,
        y: number
    },
    velocity: {
        x: number,
        y: number
    },
    direction: EFourDirSprite
}

type TGhost = TACharacter & {
    color: EGhostColor,
}

type TPacman = TACharacter;

type TGameSprite = {
    pacman: TFourDirSprite,
    ghost: Record<EGhostColor, TFourDirSprite>
}

type TGameSettings = {
    level: number,
    ghostSpeed: number,
    ghostNumber: number,
    life: number
}

const testBoard = [
    [
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    ],
    [
      1, 1, 1, 4, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 4, 3, 3, 1,
      1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1,
    ],
    [
      1, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3,
      3, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 3, 1, 1, 1,
    ],
    [
      1, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 3, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 3,
      3, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 3, 1, 1, 1,
    ],
    [
      1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 1,
      1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1,
    ],
    [
      1, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 1, 3, 3, 3, 3, 1, 1, 3, 3,
      3, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 3, 1, 1, 1,
    ],
    [
      1, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1,
      1, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 3, 1, 1, 1,
    ],
    [
      1, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1,
      1, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 3, 1, 1, 1,
    ],
    [
      1, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 1, 3, 3, 3, 3, 1, 1, 3, 3,
      3, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 3, 1, 1, 1,
    ],
    [
      1, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1,
      1, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 3, 1, 1, 1,
    ],
    [
      1, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1,
      1, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 3, 1, 1, 1,
    ],
    [
      1, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 1, 3, 3, 3, 3, 1, 1, 3, 3,
      3, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 3, 1, 1, 1,
    ],
    [
      1, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1,
      1, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 3, 1, 1, 1,
    ],
    [
      1, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1,
      1, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 3, 1, 1, 1,
    ],
    [
      1, 1, 1, 3, 1, 1, 1, 1, 1, 3, 1, 1, 3, 1, 3, 1, 1, 3, 3, 3, 3, 1, 1, 3, 3,
      3, 3, 1, 1, 3, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1,
    ],
    [
      1, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 3, 1, 1, 1, 1, 3, 3, 1, 1, 3, 1,
      1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 1, 3, 1, 1, 1,
    ],
    [
      1, 1, 1, 3, 1, 1, 1, 1, 1, 3, 1, 1, 3, 1, 3, 1, 1, 3, 3, 1, 1, 1, 1, 1, 3,
      3, 3, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    ],
    [
      1, 1, 1, 3, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 3, 1, 1, 3, 3, 3, 3, 1, 1, 3, 3,
      3, 3, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    ],
    [
      1, 1, 1, 3, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 3, 1, 1, 1, 1, 3, 3, 1, 1, 3, 1,
      1, 1, 1, 1, 3, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1,
    ],
    [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    ],
];

const Game = () => {
    const mapSrc = "img/map.png";
    const gridSize = 20;
    const drawSize = 16;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [grid, setGrid] = useState<EItem[][]>(testBoard);
    const [score, setScore] = useState<number>(0);
    const [ghostList, setGhostList] = useState<TGhost[]>([
        {color: EGhostColor.red, location: {x: 430, y: 250}, velocity: {x: 0,y: 0}, direction: EFourDirSprite.down},
        {color: EGhostColor.pink, location: {x: 430, y: 210}, velocity: {x: 0,y: 0}, direction: EFourDirSprite.left},
        {color: EGhostColor.blue, location: {x: 450, y: 250}, velocity: {x: 0,y: 0}, direction: EFourDirSprite.up},
        {color: EGhostColor.orange, location: {x: 450, y: 210}, velocity: {x: 0,y: 0}, direction: EFourDirSprite.right},
    ]);
    const [pacman, setPacman] = useState<TPacman>({
        location: {
            x: 430,
            y: 370
        },
        velocity: {
            x: 0,
            y: 0
        },
        direction: EFourDirSprite.left
    });
    const gameSpriteRef = useRef<TGameSprite>();
    const [bigDotOn, setBigDotOn] = useState<boolean>(true);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [settings, setSettings] = useState<TGameSettings>({
        level: 1,
        ghostSpeed: 1,
        ghostNumber: 4,
        life: 3
    })
    const [tmpSettings, setTmpSettings] = useState<TGameSettings>();
    const [life, setLife] = useState<number>(3);

    const canvasWidth = 800;
    const canvasHeight = 400;

    const gameIntervalRef = useRef<NodeJS.Timer[]>([]);

    useEffect(() => {
        const img = new Image();
        img.src = "img/sprite.png";
        const size = 16;
        gameSpriteRef.current = {
            pacman: {
                right: new Sprite(img, size, size, drawSize, drawSize, 0, 0, 2, SpriteXStrategy),
                left: new Sprite(img, size, size, drawSize, drawSize, 0, size, 2, SpriteXStrategy),
                up: new Sprite(img, size, size, drawSize, drawSize, 0, 2*size, 2, SpriteXStrategy),
                down: new Sprite(img, size, size, drawSize, drawSize, 0, 3*size, 2, SpriteXStrategy)
            },
            ghost: {
                [EGhostColor.red]: {
                    right: new Sprite(img, size, size, drawSize, drawSize, 2, 4*size, 2, SpriteXStrategy),
                    left: new Sprite(img, size, size, drawSize, drawSize, 2*size+2, 4*size, 2, SpriteXStrategy),
                    up: new Sprite(img, size, size, drawSize, drawSize, 4*size+2, 4*size, 2, SpriteXStrategy),
                    down: new Sprite(img, size, size, drawSize, drawSize, 6*size+2, 4*size, 2, SpriteXStrategy)
                },
                [EGhostColor.pink]: {
                    right: new Sprite(img, size, size, drawSize, drawSize, 2, 5*size, 2, SpriteXStrategy),
                    left: new Sprite(img, size, size, drawSize, drawSize, 2*size+2, 5*size, 2, SpriteXStrategy),
                    up: new Sprite(img, size, size, drawSize, drawSize, 4*size+2, 5*size, 2, SpriteXStrategy),
                    down: new Sprite(img, size, size, drawSize, drawSize, 6*size+2, 5*size, 2, SpriteXStrategy)
                },
                [EGhostColor.blue]: {
                    right: new Sprite(img, size, size, drawSize, drawSize, 2, 6*size, 2, SpriteXStrategy),
                    left: new Sprite(img, size, size, drawSize, drawSize, 2*size+2, 6*size, 2, SpriteXStrategy),
                    up: new Sprite(img, size, size, drawSize, drawSize, 4*size+2, 6*size, 2, SpriteXStrategy),
                    down: new Sprite(img, size, size, drawSize, drawSize, 6*size+2, 6*size, 2, SpriteXStrategy)
                },
                [EGhostColor.orange]: {
                    right: new Sprite(img, size, size, drawSize, drawSize, 2, 7*size, 2, SpriteXStrategy),
                    left: new Sprite(img, size, size, drawSize, drawSize, 2*size+2, 7*size, 2, SpriteXStrategy),
                    up: new Sprite(img, size, size, drawSize, drawSize, 4*size+2, 7*size, 2, SpriteXStrategy),
                    down: new Sprite(img, size, size, drawSize, drawSize, 6*size+2, 7*size, 2, SpriteXStrategy)
                },
            }
        }
        startGame();
    }, [])

    useEffect(() => {
        setTmpSettings(settings);
    }, [settings]);

    const updateDirection = (character: TACharacter) => {
        if (character.velocity.x && character.velocity.x > 0) {
            character.direction = EFourDirSprite.right;
        } else if (character.velocity.x && character.velocity.x < 0) {
            character.direction = EFourDirSprite.left;
        } else if (character.velocity.y && character.velocity.y > 0) {
            character.direction = EFourDirSprite.down;
        } else if (character.velocity.y && character.velocity.y < 0) {
            character.direction = EFourDirSprite.up;
        }
    }

    const drawPacman = (context: CanvasRenderingContext2D) => {
        if (!pacman) {
            return;
        }

        updateDirection(pacman);

        gameSpriteRef.current?.pacman[pacman.direction].draw(context, pacman.location.x - drawSize / 2, pacman.location.y - drawSize / 2);
    }

    const drawGhosts = (context: CanvasRenderingContext2D) => {
        if (!ghostList) {
            return;
        }

        ghostList.forEach((ghost, idx) => {
            updateDirection(ghost);
            gameSpriteRef.current?.ghost[ghost.color][ghost.direction].draw(context, ghost.location.x - drawSize / 2, ghost.location.y - drawSize / 2);
        });
    }

    const updatePosition = () => {
        const context = canvasRef.current?.getContext("2d");
        context?.clearRect(0, 0, canvasWidth, canvasHeight);
        if (!context) {
            return;
        }
        drawPacman(context);
        drawGhosts(context);
    }

    const updateFrame = () => {
        if (!pacman) {
            return;
        }
        if (pacman.velocity.x !== 0 || pacman.velocity.y !== 0) {
            gameSpriteRef.current?.pacman[pacman.direction].updateFrame();
        }
        ghostList.forEach((ghost, idx) => {
            gameSpriteRef.current?.ghost[ghost.color][ghost.direction].updateFrame();
        });
    }

    const toggleBigDotOn = () => {
        setBigDotOn(prevData => !prevData);
    }

    const startGame = () => {
        if (gameIntervalRef.current.length !== 0) {
            return;
        }

        gameIntervalRef.current.push(setInterval(() => {
            updatePosition();
            toggleBigDotOn();
        }, 200));

        gameIntervalRef.current.push(setInterval(() => {
            updateFrame();
        }, 500));
    }

    const pauseGame = () => {
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

            default:
                return(
                    <div className="" key={key} style={{ width: "20px", height: "20px" }}></div>
                );
        }
    }

    const closeSettings = () => {
        setShowSettings(false);
        startGame();
    }

    const saveSettings = () => {
        setSettings(tmpSettings ?? settings);
        setShowSettings(false);
        startGame();
    }

    return (
        <div className="d-flex flex-column justify-content-center" style={{minHeight: "100vh"}}>
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
                            min={1}
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
                        <span className="score font-weight-bold text-start fs-5">Score: { score }</span>
                    </div>
                    <div className="end-box">
                        <button className="btn btn-no-border" onClick={() => {pauseGame(); setShowSettings(true)}} style={{color: "#ff0000"}}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="40px" width="40px" viewBox="0 0 320 512" style={{fill: "white"}}><path d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>
                        </button>
                    </div>
                </div>
                <div className="position-relative" style={{}}>
                    <canvas id="canvas" width={`${canvasWidth}px`} height={`${canvasHeight}px`} style={{backgroundImage: `url(img/map-level-${settings.level}.png)`}} ref={canvasRef}/>
                    <div className="board-objects position-absolute t-0 s-0" style={{top: "0", left: "0"}}>
                        <div className="board d-flex flex-column" >
                            {   grid.map((rowArr, row) => (
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
                        {   Array.from({length: life}, (_, idx) => (
                            <img src="img/life.png" alt="Oops.." key={idx}/>
                        ))}
                    </div>
                    <span>{ `LEVEL ${settings.level}` }</span>
                </div>
            </div>
        </div>
    );
}
 
export default Game;