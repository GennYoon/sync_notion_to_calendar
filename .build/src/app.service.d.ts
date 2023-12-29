import { ConfigService } from '@nestjs/config';
export declare class AppService {
    private config;
    constructor(config: ConfigService);
    getHello(): Promise<any>;
}
