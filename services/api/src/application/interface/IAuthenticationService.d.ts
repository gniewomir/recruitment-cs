import {IUserDto} from "../../domain/interface/user";
import {IAuthenticated} from "./IAuthenticated";
import {Response} from "express";

export interface IAuthenticationService {

    checkAuthentication(token: string): Promise<IAuthenticated>

    createAuthentication(user: IUserDto): Promise<IAuthenticated>

    revokeAuthentication(token: string): Promise<boolean>

    authenticateResponse(token: string, res: Response): Promise<Response>;

    authenticationFromResponse(res: Response): IAuthenticated;

}