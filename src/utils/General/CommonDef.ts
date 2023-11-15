export module CommonDef {
    export type ReactStateDictArr = Record<string, any>[];
    export type ReactSetStateDictArr = React.Dispatch<React.SetStateAction<Record<string, any>[]>>;

    export type ReactSetStateString = React.Dispatch<React.SetStateAction<string>>;
}