import config from '../../application/config';
import app from "../../application/loader";
import request from "supertest";
import {Container} from "typedi";
import AuthenticationService from "../../application/service/authentication";
import {IAuthenticationService} from "../../application/interface/IAuthenticationService";
import UserRepository from "../../database/repository/user";
import {IUserRepository} from "../../domain/interface/IUserRepository";
import faker from "faker";
import {getConnection} from "typeorm";

afterAll(async () => {
    const connection  = getConnection();
    if (connection.isConnected) {
        await connection.close();
    }
})

describe('Authenticate middleware', () => {
    it('requires valid token for not whitelisted routes', async () => {
        config.security.authentication.whitelist = [];
        const application = await app();
        await request(application)
            .post(`${config.api.prefix}/token`)
            .expect(401);
    });
    it('does nothing for routes whitelisted in config', async () => {
        config.security.authentication.whitelist = [
            {
                method: "POST",
                route: `${config.api.prefix}/token`
            }
        ];
        const application = await app();
        await request(application)
            .post(`${config.api.prefix}/token`)
            .expect(400);
    });
    it('ignores request path trailing slash for routes whitelisted in config', async () => {
        config.security.authentication.whitelist = [
            {
                method: "POST",
                route: `${config.api.prefix}/token`
            }
        ];
        const application = await app();
        await request(application)
            .post(`${config.api.prefix}/token/`)
            .expect(400);
    });
    it('ignores request query string for routes whitelisted in config', async () => {
        config.security.authentication.whitelist = [
            {
                method: "POST",
                route: `${config.api.prefix}/token`
            }
        ];
        const application = await app();
        await request(application)
            .post(`${config.api.prefix}/token`)
            .query({
                test: "test"
            })
            .expect(400);
    });
    it('authenticates even whitelisted routes if possible', async () => {
        config.security.authentication.whitelist = [
            {
                method: "POST",
                route: `${config.api.prefix}/token`
            }
        ];
        const application = await app();
        const repository = Container.get(UserRepository) as IUserRepository;
        const authenticationService = Container.get(AuthenticationService) as IAuthenticationService;
        const email = faker.internet.email();
        const password = faker.internet.password();
        const user = await repository.createAndSave(faker.name.findName(), email, password);
        const authentication = await authenticationService.createAuthentication(user)

        await request(application)
            .post(`${config.api.prefix}/token`)
            .set('authorization', `Bearer ${authentication.token.token}`)
            .expect(201)
            .then(async (response) => {
                const authenticated = await authenticationService.checkAuthentication(response.body.token);
                expect(authenticated.user.email).toBe(email);
            });
    });
})