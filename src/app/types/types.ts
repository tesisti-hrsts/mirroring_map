export type MoveEvent = {
    type: EventTypes,
    clientId: String,
    timestamp: EpochTimeStamp,
    zoomLevel?: Number,
    center?: Number[]
}

export type PointEvent = {
    type: EventTypes,
    clientId: String,
    timestamp: EpochTimeStamp,
    coordinates?: Number[]
}

export type CloseDialogEvent = {
    type: EventTypes,
    clientId: String,
    timestamp: EpochTimeStamp
}

export type LegendEvent = {
    type: EventTypes,
    clientId: String,
    timestamp: EpochTimeStamp,
    visibility: Boolean
}

export type PointerEvent = {
    type: EventTypes,
    clientId: String,
    timestamp: EpochTimeStamp,
    coordinates: Number[]
}

export type RemovePointerEvent = {
    type: EventTypes,
    clientId: String,
    timestamp: EpochTimeStamp
}

export enum EventTypes {
    MOVE_EVENT = 'MOVE_EVENT',
    POINT_EVENT = 'POINT_EVENT',
    CLOSE_DIALOG_EVENT = 'CLOSE_DIALOG_EVENT',
    LEGEND_EVENT = 'LEGEND_EVENT',
    POINTER_EVENT = 'POINTER_EVENT',
    REMOVE_POINTER_EVENT = 'REMOVE_POINTER_EVENT'
}