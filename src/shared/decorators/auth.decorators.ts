import { applyDecorators, UseGuards } from "@nestjs/common";
import { UserRole } from "../enums/User.types";
import { AuthGuard } from "src/guards/auth.guard";
import { Role } from "./role.decorators";
import { ApiBearerAuth } from "@nestjs/swagger";

export const Auth = (...roles : UserRole[]) => {
    return applyDecorators(
        UseGuards(AuthGuard),
        Role(...roles),
        ApiBearerAuth()
    )
} 