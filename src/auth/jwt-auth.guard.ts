import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {Observable} from "rxjs";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req = context.switchToHttp().getRequest()
        try {
            const authHeader = req.headers.authorization;
            const tokenType = authHeader.split(" ")[0];
            const token = authHeader.split(" ")[1];
            if(tokenType !== "Bearer" || !token) {
                throw new Error();
            }
            const user = this.jwtService.verify(token);
            if(user.who !== 'user') throw new Error()
            req.user = user;
            return user;
        } catch (e){
            throw new UnauthorizedException("Unauthorized");
        }
    }
}