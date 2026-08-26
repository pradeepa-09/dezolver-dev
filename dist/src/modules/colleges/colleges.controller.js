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
exports.CollegesController = void 0;
const common_1 = require("@nestjs/common");
const colleges_service_1 = require("./colleges.service");
const create_college_dto_1 = require("./dto/create-college.dto");
const update_college_dto_1 = require("./dto/update-college.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../../common/authorization/guards/permissions.guard");
const require_permission_decorator_1 = require("../../common/authorization/decorators/require-permission.decorator");
let CollegesController = class CollegesController {
    collegesService;
    constructor(collegesService) {
        this.collegesService = collegesService;
    }
    create(createCollegeDto, req) {
        return this.collegesService.create(createCollegeDto, req.user.id);
    }
    findAll() {
        return this.collegesService.findAll();
    }
    findOne(id) {
        return this.collegesService.findOne(id);
    }
    update(id, updateCollegeDto, req) {
        return this.collegesService.update(id, updateCollegeDto, req.user.id);
    }
    suspend(id, req) {
        return this.collegesService.suspend(id, req.user.id);
    }
    reactivate(id, req) {
        return this.collegesService.reactivate(id, req.user.id);
    }
    impersonate(id, req) {
        return this.collegesService.impersonate(id, req.user.id);
    }
    impersonateStop(req) {
        return this.collegesService.impersonateStop(req.user);
    }
};
exports.CollegesController = CollegesController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permission_decorator_1.RequirePermission)('colleges:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_college_dto_1.CreateCollegeDto, Object]),
    __metadata("design:returntype", void 0)
], CollegesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permission_decorator_1.RequirePermission)('colleges:list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CollegesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('colleges:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CollegesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permission_decorator_1.RequirePermission)('colleges:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_college_dto_1.UpdateCollegeDto, Object]),
    __metadata("design:returntype", void 0)
], CollegesController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/suspend'),
    (0, require_permission_decorator_1.RequirePermission)('colleges:manage_status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CollegesController.prototype, "suspend", null);
__decorate([
    (0, common_1.Post)(':id/reactivate'),
    (0, require_permission_decorator_1.RequirePermission)('colleges:manage_status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CollegesController.prototype, "reactivate", null);
__decorate([
    (0, common_1.Post)(':id/impersonate'),
    (0, require_permission_decorator_1.RequirePermission)('colleges:impersonate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CollegesController.prototype, "impersonate", null);
__decorate([
    (0, common_1.Post)(':id/impersonate-stop'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CollegesController.prototype, "impersonateStop", null);
exports.CollegesController = CollegesController = __decorate([
    (0, common_1.Controller)('colleges'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [colleges_service_1.CollegesService])
], CollegesController);
//# sourceMappingURL=colleges.controller.js.map