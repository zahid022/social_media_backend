import { hash } from "bcrypt";
import { BaseEntity, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProfileEntity } from "./profile.entity";
import { UserProvider } from "src/shared/enums/User.types";
import { FollowEntity } from "./folllow.entity";

@Entity("users")
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ nullable: true, unique: true })
    email: string;

    @Column({ nullable: true, unique: true })
    phone: string;

    @Column()
    password: string;

    @Column({ type: 'enum', enum: UserProvider, default: UserProvider.LOCAL })
    provider: UserProvider;

    @Column({ nullable: true })
    providerId: string;

    @Column({ default: false })
    isPrivate: boolean

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @OneToOne(() => ProfileEntity, (profile: ProfileEntity) => profile.user, { cascade: true })
    profile: ProfileEntity

    @OneToMany(() => FollowEntity, (follow : FollowEntity) => follow.from)
    following : FollowEntity[]

    @OneToMany(() => FollowEntity, (follow : FollowEntity) => follow.to)
    follower : FollowEntity[]

    @BeforeInsert()
    @BeforeUpdate()
    async beforeUpsert() {
        if (!this.password) return

        this.password = await hash(this.password, 10)
    }
}