import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn} from "typeorm";

export interface GenericPouchDoc {
    _id?: string;
    _rev?: string;
    entityType?: string;
    appVersion?: string;
    createdDate?: string;
    updatedDate?: string;

    [key: string]: any;
}

export abstract class GenericOrmDoc extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column({type: "varchar"})
    appVersion?: string;

    @CreateDateColumn({type: "varchar", nullable: true})
    createdDate?: string;

    @UpdateDateColumn({type: "varchar", nullable: true})
    updatedDate?: string;
}

@Entity('Counters')  // Defines the table name
export class Counter extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id?: string;  // The unique ID of the counter
    @Column('varchar')
    name: string;
    @Column('int')
    seq: number;  // The current sequence number
    @VersionColumn()
    version: number;

    constructor(name: string, seq: number) {
        super();
        this.name = name;
        this.seq = seq;
        this.version = 1;
    }
}