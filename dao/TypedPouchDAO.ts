import {GenericPouchDoc, IDocTypeProvider, ValidatingPouchDAO} from './GenericPouchDAO';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import * as Validation from "./DatabaseValidation";
import Joi from "joi";

PouchDB.plugin(PouchDBFind);


class UserDAO extends ValidatingPouchDAO<UserDoc> implements IDocTypeProvider {
    static async create(db?: PouchDB.Database): Promise<UserDAO> {
        const dao = new UserDAO(db || new PouchDB(process.env.DB_NAME), DocType.User);
        await dao.createIndex('email');
        return dao;
    }

    getSchema(): Joi.ObjectSchema {
        return Validation.getUserDocSchema();
    }

    async findByEmail(email: string): Promise<UserDoc[]> {
        return this.findByField('email', email);
    }
}

class RoleDAO extends ValidatingPouchDAO<RoleDoc> implements IDocTypeProvider {
    static async create(db?: PouchDB.Database): Promise<RoleDAO> {
        const dao = new RoleDAO(db || new PouchDB(process.env.DB_NAME), DocType.Role);
        await dao.createIndex('roleType');
        return dao;
    }

    getSchema(): Joi.ObjectSchema {
        return Validation.getRoleDocSchema();
    }

    async findByRole(roleType: string): Promise<RoleDoc[]> {
        return this.findByField('roleType', roleType);
    }
}

class UserRoleDAO extends ValidatingPouchDAO<UserRoleDoc> implements IDocTypeProvider {
    static async create(db?: PouchDB.Database): Promise<UserRoleDAO> {
        const dao = new UserRoleDAO(db || new PouchDB(process.env.DB_NAME), DocType.UserRole);
        await dao.createIndex('userId');
        await dao.createIndex('roleId');
        return dao;
    }

    getSchema(): Joi.ObjectSchema {
        return Validation.getUserRoleDocSchema();
    }

    async getRoleIdsForUser(userId: string): Promise<string[]> {
        const userRoles = await this.findByField('userId', userId);
        // @ts-ignore
        return userRoles.map(ur => ur.roleId);
    }

    async getUserIdsForRole(roleId: string): Promise<string[]> {
        const userRoles = await this.findByField('roleId', roleId);
        // @ts-ignore
        return userRoles.map(ur => ur.userId);
    }

    async addRolesToUser(userId: string, roles: string[]) {
        const existingRoles: UserRoleDoc[] = await this.findByField('userId', userId);

        // Find out which roles need to be added
        const rolesToAdd = roles.filter(role => !existingRoles.some(existingRole => existingRole.roleId === role));
        // Find out which existing roles need to be deleted
        const rolesToDeleteDocs = existingRoles.filter(existingRole => !roles.includes(existingRole.roleId));

        // Create UserRoleDoc objects for the roles to be added
        const userRolesToAdd: UserRoleDoc[] = rolesToAdd.map(roleId => ({
            _id: "",
            entityType: "",
            userId: userId,
            roleId: roleId
        }));

        // Handle roles to delete
        if (rolesToDeleteDocs.length > 0) {
            for (const roleDoc of rolesToDeleteDocs) {
                if (roleDoc._id) await this.delete(roleDoc._id);
            }
        }

        // Handle roles to add
        if (userRolesToAdd.length > 0) {
            return await this.bulkSave(userRolesToAdd) as UserRoleDoc[];
        }
    }

    async updateRolesForUser(userId: string, newRoleIds: string[]) {
        const existingRoles: UserRoleDoc[] = await this.findByField('userId', userId);

        // Find roles to delete
        const rolesToDeleteDocs = existingRoles.filter(existingRole => !newRoleIds.includes(existingRole.roleId));

        // Find roles to add
        const userRolesToAdd: UserRoleDoc[] = newRoleIds
            .filter(roleId => !existingRoles.some(existingRole => existingRole.roleId === roleId))
            .map(roleId => ({
                userId: userId,
                roleId: roleId
            }));

        // Delete roles
        for (const roleDoc of rolesToDeleteDocs) {
            if (roleDoc._id) await this.delete(roleDoc._id);
        }

        // Add new roles
        if (userRolesToAdd.length > 0) {
            return await this.bulkSave(userRolesToAdd) as UserRoleDoc[];
        }
    }

    async removeRolesFromUser(userId: string, rolesToRemove?: string[]) {
        const existingRoles: UserRoleDoc[] = await this.findByField('userId', userId);

        let rolesToDeleteDocs: UserRoleDoc[];

        if (rolesToRemove) {
            // Delete only the roles specified in the rolesToRemove array
            rolesToDeleteDocs = existingRoles.filter(existingRole => rolesToRemove.includes(existingRole.roleId));
        } else {
            // Delete all roles if no rolesToRemove array is provided
            rolesToDeleteDocs = existingRoles;
        }

        // Delete the roles
        for (const roleDoc of rolesToDeleteDocs) {
            if (roleDoc._id) await this.delete(roleDoc._id);
        }
    }
}

class BusinessGroupDAO extends ValidatingPouchDAO<BusinessGroupDoc> implements IDocTypeProvider {
    static async create(db?: PouchDB.Database): Promise<BusinessGroupDAO> {
        const dao = new BusinessGroupDAO(db || new PouchDB(process.env.DB_NAME), DocType.BusinessGroup);
        await dao.createIndex('name');
        await dao.createIndex('shortcode');
        return dao;
    }

    getSchema(): Joi.ObjectSchema {
        return Validation.getBusinessGroupDocSchema();
    }

    async findByName(name: string): Promise<BusinessGroupDoc[]> {
        return this.findByField('name', name);
    }

    async findByShortcode(shortcode: string): Promise<BusinessGroupDoc[]> {
        return this.findByField('shortcode', shortcode);
    }
}

class SupplierDAO extends ValidatingPouchDAO<SupplierDoc> implements IDocTypeProvider {
    static async create(db?: PouchDB.Database): Promise<SupplierDAO> {
        const dao = new SupplierDAO(db || new PouchDB(process.env.DB_NAME), DocType.Supplier);
        await dao.createIndex('name');
        return dao;
    }

    getSchema(): Joi.ObjectSchema {
        return Validation.getSupplierDocSchema();
    }

    async findByName(name: string): Promise<SupplierDoc[]> {
        return this.findByField('name', name);
    }
}

class PurchaseOrderDAO extends ValidatingPouchDAO<PurchaseOrderDoc> implements IDocTypeProvider {
    static async create(db?: PouchDB.Database): Promise<PurchaseOrderDAO> {
        const dao = new PurchaseOrderDAO(db || new PouchDB(process.env.DB_NAME), DocType.PurchaseOrder);
        await dao.createIndex('requestorId');
        await dao.createIndex('approvalGroupId');
        await dao.createIndex('businessGroupId');
        await dao.createIndex('status');
        return dao;
    }

    getSchema(): Joi.ObjectSchema {
        return Validation.getPurchaseOrderDocSchema();
    }

    async findByRequestorId(requestorId: string): Promise<PurchaseOrderDoc[]> {
        return this.findByField('requestorId', requestorId);
    }

    async findByApprovalGroupId(approvalGroupId: string): Promise<PurchaseOrderDoc[]> {
        return this.findByField('approvalGroupId', approvalGroupId);
    }

    async findByBusinessGroupId(businessGroupId: string): Promise<PurchaseOrderDoc[]> {
        return this.findByField('businessGroupId', businessGroupId);
    }

    async findByStatus(status: string): Promise<PurchaseOrderDoc[]> {
        return this.findByField('status', status);
    }
}

class LineItemDAO extends ValidatingPouchDAO<LineItemDoc> implements IDocTypeProvider {
    static async create(db?: PouchDB.Database): Promise<LineItemDAO> {
        const dao = new LineItemDAO(db || new PouchDB(process.env.DB_NAME), DocType.LineItem);
        await dao.createIndex('name');
        await dao.createIndex('status');
        return dao;
    }

    getSchema(): Joi.ObjectSchema {
        return Validation.getLineItemDocSchema();
    }

    async findByStatus(status: string): Promise<LineItemDoc[]> {
        return this.findByField('status', status);
    }

    async findByName(name: string): Promise<LineItemDoc[]> {
        return this.findByField('name', name);
    }

}

export {
    SupplierDAO,
    UserDAO,
    UserRoleDAO,
    RoleDAO,
    BusinessGroupDAO,
    PurchaseOrderDAO,
    LineItemDAO
};

// =============================================================================================================
// Lookups and DTOs
// =============================================================================================================
export enum DocType {
    User = 'User|',
    PurchaseOrder = 'PurchaseOrder|',
    LineItem = 'LineItem|',
    Supplier = 'Supplier|',
    Role = 'Role|',
    UserRole = 'UserRole|',
    BusinessGroup = 'BusinessGroup|'
}

export interface UserDoc extends GenericPouchDoc {
    name: string;
    email: string;
    inactive?: boolean;
    hashedPassword?: string;
    salt?: string;
}

export interface RoleDoc extends GenericPouchDoc {
    roleType: string;
    businessGroupId: string;
}

export interface BusinessGroupDoc extends GenericPouchDoc {
    name: string;
    shortcode: string;
}

export interface UserRoleDoc extends GenericPouchDoc {
    userId: string;
    roleId: string;
}

export interface SupplierDoc extends GenericPouchDoc {
    name: string;
    email?: string;
    website?: string;
    phone?: string;
    address?: string;
    repName?: string;
}

export interface LineItemDoc extends GenericPouchDoc {
    name: string;
    quantity: number;
    estimatedPrice?: number;
    actualPrice?: number;
    proposedSupplierId?: string;
    actualSupplierId?: string;
    notes?: string;
    status: string;
}

export interface PurchaseOrderDoc extends GenericPouchDoc {
    requestorId: string;
    lineItemIds?: string[];
    status: string;
    approvalGroupId: string;
    approvedByUserId?: string;
    purchaseOrderRef?: string;
    taskDescription: string;
    businessGroupId: string;
    workLocation: string;
    isBlocking: boolean;
    requiredBy?: Date;
}