import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { ImageEntity } from "./image.entity";

@Entity('profiles')
export class ProfileEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    fullName : string;

    @Column({nullable : true})
    bio : string;

    @Column({default : 0})
    follower : number;

    @Column({default : 0})
    following : number;

    @Column({default : 0})
    postCount : number;

    @Column({nullable : true})
    imageId : string;

    @OneToOne(() => ImageEntity)
    @JoinColumn({
        name : 'imageId',
        referencedColumnName : 'id'
    })
    profile_picture : ImageEntity

    @Column()
    userId : number;

    @OneToOne(() => UserEntity, (user : UserEntity) => user.profile, {onDelete : "CASCADE"})
    @JoinColumn({
        name : 'userId'
    })
    user : UserEntity;

    @CreateDateColumn({type : 'timestamptz'})
    createdAt : Date;

    @UpdateDateColumn({type : 'timestamptz'})
    updatedAt : Date;
}