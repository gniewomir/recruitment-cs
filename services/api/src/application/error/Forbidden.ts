import {IError} from "../interface/IError";
import ApiError from "./ApiError";

export default class Forbidden extends ApiError implements IError {
    constructor(message: string, previous?: any) {
        super(message, 403, previous)
    }
}