import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    VersionColumn
} from "typeorm";

export interface GenericDoc {
    _id?: string;
    createdDate?: string;
    updatedDate?: string;
    appVersion?: string;
}

export interface GenericPouchDoc extends GenericDoc {
    _rev?: string;
    entityType?: string;
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
    _id?: string;
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
        this._rev = 0;
    }
}