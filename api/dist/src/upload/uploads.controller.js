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
exports.UploadsController = void 0;
const common_1 = require("@nestjs/common");
const path = require("path");
const fs = require("fs");
const upload_service_1 = require("./upload.service");
let UploadsController = class UploadsController {
    constructor(uploadService) {
        this.uploadService = uploadService;
    }
    serveFile(folder, filename, res) {
        const cleanFolder = path.basename(folder.replace(/[^a-zA-Z0-9_-]/g, ''));
        const cleanFilename = path.basename(filename.replace(/[^a-zA-Z0-9._-]/g, ''));
        const filePath = path.join(this.uploadService.getLocalStoragePath(), cleanFolder, cleanFilename);
        if (!fs.existsSync(filePath)) {
            throw new common_1.NotFoundException('Uploaded file not found');
        }
        res.sendFile(filePath);
    }
};
exports.UploadsController = UploadsController;
__decorate([
    (0, common_1.Get)(':folder/:filename'),
    __param(0, (0, common_1.Param)('folder')),
    __param(1, (0, common_1.Param)('filename')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], UploadsController.prototype, "serveFile", null);
exports.UploadsController = UploadsController = __decorate([
    (0, common_1.Controller)('uploads'),
    __metadata("design:paramtypes", [upload_service_1.UploadService])
], UploadsController);
//# sourceMappingURL=uploads.controller.js.map