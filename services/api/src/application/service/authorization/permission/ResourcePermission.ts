import {Permission} from "./Permission";
import {IPermission} from "../../../type/authorization";
import {HttpMethod} from "../../../type/http";
import {IRepository} from "../../../../database/type/IRepository";

export class ResourcePermission extends Permission implements IPermission {

    constructor(
        private requestMethod: HttpMethod,
        private resourceRepository: IRepository,
        private resourceId?: number | string) {
        super();
    }

    toString(): string {
        if (this.resourceId) {
            return [super.toString(), this.resourceRepository.getEntityName(), this.requestMethod, this.resourceId].join('/');
        }
        return [super.toString(), this.resourceRepository.getEntityName(), this.requestMethod].join('/');
    }

}