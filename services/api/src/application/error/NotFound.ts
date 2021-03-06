import {IError} from "../type/error";
import {ApiError} from "./ApiError";

export class NotFound extends ApiError implements IError {

    constructor(message: string = 'Not found', previous?: any) {
        super(message, 404, previous)
    }

}