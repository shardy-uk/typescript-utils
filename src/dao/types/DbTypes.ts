import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn} from "typeorm";

export interface GenericDoc {
    _id?: string;
    createdDate?: string;
    updatedDate?: string;
}

export interface GenericPouchDoc extends GenericDoc {
    _id?: string;
    _rev?: string;
    entityType?: string;
    appVersion?: string;
    createdDate?: string;
    updatedDate?: string;

    [key: string]: any;
}

export abstract class GenericOrmDoc extends BaseEntity implements GenericDoc {
    @PrimaryGeneratedColumn("uuid")
    _id?: string;

    @Column({type: "varchar"})
    appVersion?: string;

    @CreateDateColumn({type: "varchar", nullable: false})
    createdDate?: string;

    @UpdateDateColumn({type: "varchar", nullable: true})
    updatedDate?: string;
}

@Entity('Counters')  // Defines the table name
export class OrmCounter extends BaseEntity implements GenericDoc {
    @PrimaryGeneratedColumn('uuid')
    _id?: string;  // The unique ID of the counter
    @Column('varchar')
    name: string;
    @Column('int')
    seq: number;  // The current sequence number
    @VersionColumn()
    _rev: number;

    constructor(name: string, seq: number) {
        super();
        this.name = name;
        this.seq = seq;
        this._rev = 1;
    }
}