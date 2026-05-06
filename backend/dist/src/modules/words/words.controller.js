"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordsController = void 0;
const common_1 = require("@nestjs/common");
const words_service_1 = require("./words.service");
let WordsController = class WordsController {
    constructor(service) {
        this.service = service;
    }
    async findByBook(bookId, limit) {
        return this.service.findByBook(+bookId, limit ? +limit : undefined);
    }
    async findNewWords(bookId, limit) {
        return this.service.findNewWords(+bookId, limit ? +limit : undefined);
    }
    async fillPhonetics(bookId) {
        return this.service.fillPhonetics(+bookId);
    }
};
exports.WordsController = WordsController;
__decorate([
    (0, common_1.Get)('word-books/:bookId/words'),
    __param(0, (0, common_1.Param)('bookId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WordsController.prototype, "findByBook", null);
__decorate([
    (0, common_1.Get)('word-books/:bookId/words/new'),
    __param(0, (0, common_1.Param)('bookId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WordsController.prototype, "findNewWords", null);
__decorate([
    (0, common_1.Post)('word-books/:bookId/fill-phonetics'),
    __param(0, (0, common_1.Param)('bookId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WordsController.prototype, "fillPhonetics", null);
exports.WordsController = WordsController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [words_service_1.WordsService])
], WordsController);
//# sourceMappingURL=words.controller.js.map