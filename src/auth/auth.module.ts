import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {UsersModule} from "../users/users.module";
import {JwtModule} from "@nestjs/jwt";
import * as process from "node:process";

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        UsersModule,
        JwtModule.register({
            secret: process.env.PRIVATE_KEY || 'secret 123',
            signOptions: {
                expiresIn: '24h'
            }
        })
    ]
})
export class AuthModule {}
