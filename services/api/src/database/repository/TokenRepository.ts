import {Service} from "typedi";
import {Token} from "../entity/Token";
import {InjectConnection} from "typeorm-typedi-extensions";
import {Connection} from "typeorm";
import {UserRepository} from "./UserRepository";
import {User} from "../entity/User";
import {IRepository} from "../type/IRepository";


export interface ITokenRepository extends IRepository {
    blacklist(token: string, userId: number, expiration: Date): Promise<Token | undefined>

    isBlacklisted(token: string): Promise<boolean>

    find(token: string): Promise<Token | undefined>

    findByUser(userId: number): Promise<Token[]>

    exist(token: string): Promise<boolean>
}

@Service()
export class TokenRepository implements ITokenRepository {

    constructor(
        @InjectConnection() private connection: Connection,
        private userRepository: UserRepository
    ) {
    }

    public async findByUser(userId: number): Promise<Token[]> {
        return await this.connection.manager.find(Token, {where: {user: userId}, relations: ["user"]});
    }

    public async blacklist(token: string, userId: number, expiration: Date): Promise<Token> {
        if (!await this.exist(token)) {
            const entity = new Token()

            entity.token = token;
            entity.user = await this.userRepository.findById(userId);
            entity.expiration = expiration;
            entity.blacklisted = true;

            await this.connection.manager.save(Token, entity);
        }
        if (!await this.isBlacklisted(token)) {
            await this.connection.manager.update(Token, {token}, {blacklisted: true});
        }
        return this.find(token);
    }

    public async exist(token: string): Promise<boolean> {
        return !!await this.find(token);
    }

    public async find(token: string): Promise<Token | undefined> {
        return this.connection.manager.findOne(Token, {token});
    }

    public async isBlacklisted(token: string): Promise<boolean> {
        const entity = await this.find(token);
        if (entity === undefined) {
            return false;
        }
        return entity.blacklisted;
    }

    public getEntityName(): string {
        return User.name;
    }

}
