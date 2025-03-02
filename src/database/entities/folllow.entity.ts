import { FollowStatus } from "src/shared/enums/Follow.types";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity('follows')
export class FollowEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: FollowStatus })
    status: FollowStatus;

    @Column()
    fromId: number;

    @Column()
    toId: number;

    @ManyToOne(() => UserEntity, (user: UserEntity) => user.following, {cascade : true, onDelete : "CASCADE"})
    @JoinColumn({name : 'fromId'})
    from: UserEntity

    @ManyToOne(() => UserEntity, (user: UserEntity) => user.follower, {cascade : true, onDelete : "CASCADE"})
    @JoinColumn({name : "toId"})
    to: UserEntity

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}