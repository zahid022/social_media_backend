import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../enums/User.types";

export const Role = (...roles : UserRole[]) => {
    return SetMetadata('role', roles)
}