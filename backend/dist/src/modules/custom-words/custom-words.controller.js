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
exports.CustomWordsController = void 0;
const common_1 = require("@nestjs/common");
const custom_words_service_1 = require("./custom-words.service");
let CustomWordsController = class CustomWordsController {
    constructor(service) {
        this.service = service;
    }
    async findAll() {
        return this.service.findAll(1);
    }
    async create(body) {
        return this.service.create(1, body);
    }
    async remove(id) {
        return this.service.remove(1, +id);
    }
};
exports.CustomWordsController = CustomWordsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomWordsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomWordsController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomWordsController.prototype, "remove", null);
exports.CustomWordsController = CustomWordsController = __decorate([
    (0, common_1.Controller)('api/custom-words'),
    __metadata("design:paramtypes", [custom_words_service_1.CustomWordsService])
], CustomWordsController);
//# sourceMappingURL=custom-words.controller.js.map