import {NextFunction, Request, RequestHandler, Response} from "express";
import cors from "cors";
import {config} from "../../application/config";
import {authenticate} from "./authenticate";
import {Container} from "typedi";
import {Forbidden} from "../../application/error/Forbidden";
import {IPermission} from "../../application/type/authorization";
import {AuthenticationService} from "../../application/service/authentication/AuthenticationService";
import {IRepository} from "../../database/type/IRepository";
import {ResourceCrudPermission} from "../../application/permission/ResourceCrudPermission";
import {HttpMethod} from "../../application/type/HttpRouteList";

export const middleware = (...args: RequestHandler[]): RequestHandler[] => {
    return [
        cors({
            origin: `${config.api.scheme}://${config.api.public_domain}${config.api.public_port !== 80 ? ':' + config.api.public_port : ''}`,
            optionsSuccessStatus: 204
        }),
        authenticate(),
        ...args
    ];
}
export const forAuthenticated = (conditionalMiddleware: RequestHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authentication = Container.get(AuthenticationService).authenticationFromResponse(res);
        if (authentication.isAuthenticated()) {
            return conditionalMiddleware(req, res, next);
        }
        next();
    }
}
export const forUnauthenticated = (conditionalMiddleware: RequestHandler): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authentication = Container.get(AuthenticationService).authenticationFromResponse(res);
        if (!authentication.isAuthenticated()) {
            return conditionalMiddleware(req, res, next);
        }
        next();
    }
}

export const requireUnauthenticated = (message: string): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authentication = Container.get(AuthenticationService).authenticationFromResponse(res);
        if (authentication.isAuthenticated()) {
            throw new Forbidden(message);
        }
        next();
    }
}

export const requirePermissions = (...args: IPermission[]): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authentication = Container.get(AuthenticationService).authenticationFromResponse(res);
        args.forEach((permission: IPermission) => {
            if (authentication.denied(permission)) {
                throw new Forbidden(`You lack permission ${permission.toString()}`);
            }
        });
        next();
    }
}

export const requireResourcePermissions = (repository: IRepository, entityIdParamName?: string | null): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authentication = Container.get(AuthenticationService).authenticationFromResponse(res);
        const repositoryPermission = new ResourceCrudPermission(req.method.toUpperCase() as HttpMethod, repository, req.params[entityIdParamName]);
        const entityPermission = new ResourceCrudPermission(req.method.toUpperCase() as HttpMethod, repository);
        if (authentication.granted(entityPermission)) {
            next();
            return;
        }
        if (authentication.granted(repositoryPermission)) {
            next();
            return;
        }
        throw new Forbidden(`You lack permission ${entityPermission.toString()} or ${repositoryPermission.toString()}`);
    }
}