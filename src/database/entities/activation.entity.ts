import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('activations')
export class ActivationEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    userId : number;

    @Column({default : 0})
    attemtps : number;

    @Column()
    token : string;

    @Column({type : 'timestamptz'})
    expiredAt : Date;
}