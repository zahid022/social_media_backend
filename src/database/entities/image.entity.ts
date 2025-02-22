import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("images")
export class ImageEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    url: string

    @CreateDateColumn({type : 'timestamptz'})
    createdAt: Date;

    @UpdateDateColumn({type : 'timestamptz'})
    updatedAt: Date;
}