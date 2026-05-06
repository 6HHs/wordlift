"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const word_books_module_1 = require("./modules/word-books/word-books.module");
const words_module_1 = require("./modules/words/words.module");
const review_module_1 = require("./modules/review/review.module");
const statistics_module_1 = require("./modules/statistics/statistics.module");
const custom_words_module_1 = require("./modules/custom-words/custom-words.module");
const exams_module_1 = require("./modules/exams/exams.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            word_books_module_1.WordBooksModule,
            words_module_1.WordsModule,
            review_module_1.ReviewModule,
            statistics_module_1.StatisticsModule,
            custom_words_module_1.CustomWordsModule,
            exams_module_1.ExamsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map