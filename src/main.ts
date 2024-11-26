import * as process from "node:process";
import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function start(){
    const PORT = process.env.PORT || 5000
    const app = await NestFactory.create(AppModule)

    const config = new DocumentBuilder()
        .setTitle("Sound Sphere API")
        .setVersion('1.0.0')
        .setDescription('Source code: https://github.com/pheroom/sound-sphere-backend')
        .build()
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document);

    await app.listen(PORT, () => console.log(`Listening on ${PORT}`))
}

start()