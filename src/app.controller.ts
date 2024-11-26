import {Controller, Get} from "@nestjs/common";

@Controller('/api')
export class AppController {

    @Get('/users')
    getUsers(){
        return [{name: 'name1', id: 32}]
    }
}