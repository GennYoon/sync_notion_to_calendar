"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const ics = __importStar(require("ics"));
const dayjs_1 = __importDefault(require("dayjs"));
const src_1 = require("@notionhq/client/build/src");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AppService = class AppService {
    constructor(config) {
        this.config = config;
    }
    async getCalendar() {
        const notionSecretKey = this.config.get('NOTION_SECRET_KEY');
        const notionDatabaseId = this.config.get('NOTION_DATABASE_ID');
        try {
            const notion = new src_1.Client({ auth: notionSecretKey });
            const response = await notion.databases.query({
                database_id: notionDatabaseId,
            });
            const events = response.results.map(({ properties }) => {
                const { 이름, 날짜 } = properties;
                const { start, end } = 날짜['date'];
                let startData = [
                    Number((0, dayjs_1.default)(start).format('YYYY')),
                    Number((0, dayjs_1.default)(start).format('MM')),
                    Number((0, dayjs_1.default)(start).format('DD')),
                ];
                if (end) {
                    startData = [
                        ...startData,
                        Number((0, dayjs_1.default)(start).format('HH')),
                        Number((0, dayjs_1.default)(start).format('mm')),
                    ];
                }
                const result = {
                    title: 이름['title'][0].text.content,
                    start: startData,
                };
                if (end) {
                    const date = Number((0, dayjs_1.default)(end).diff((0, dayjs_1.default)(start), 'minutes'));
                    const days = Math.floor(date / (60 * 24));
                    const remainingDays = date % (60 * 24);
                    const hours = remainingDays / 60;
                    const minutes = remainingDays % 60;
                    result['duration'] = { days, hours, minutes };
                }
                return result;
            });
            const { value } = ics.createEvents(events);
            return value;
        }
        catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppService);
//# sourceMappingURL=app.service.js.map