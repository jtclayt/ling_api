import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { DataTypes, Model, Optional } from "sequelize";

import { MSSqlClient } from "../clients/mssql.client";

const PROTECTED_ATTRIBUTES = ["passwordHash"];

interface UserAttributes {
  id: number;
  userName: string,
  firstName: string,
  lastName: string,
  passwordHash: string,
  token?: string,
  createdAt?: Date,
  updatedAt?: Date,
  deletedAt?: Date
}

export interface UserInput extends Optional<UserAttributes, "id"> {};

export class User extends Model {
  public id!: number;
  public userName!: string;
  public firstName!: string;
  public lastName!: string;
  public token!: string;
  private passwordHash!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date;

  /**
   * Method for generating a password hash.
   * @param password The user created password.
   * @returns Password hash and salt.
   */
  static hashPassword(password: string): string {
    const salt = randomBytes(16).toString("hex");
    const hashedPassword = scryptSync(password, salt, 64).toString("hex");

    return `${salt}:${hashedPassword}`;
  }

  /**
   * Removes any protected fields from model.
   * @returns Object without protected fields.
   */
  public toJSON(): Object {
    let attributes = Object.assign({}, this.get())
    for (const a of PROTECTED_ATTRIBUTES) {
      delete attributes[a];
    }
    return attributes;
  }

  /**
   * Gets the users full name for formatting
   * @returns Users full name
   */
  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Timing attack safe method for checking login password.
   * @param password The password to check
   * @returns Whether the password is correct.
   */
  public checkPassword(password: string): boolean {
    const [salt, hash] = this.passwordHash.split(':');
    const hashedBuffer = scryptSync(password, salt, 64);
    const hashBuffed = Buffer.from(hash, "hex");
    return timingSafeEqual(hashedBuffer, hashBuffed);
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,

  },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  token: DataTypes.STRING,
  passwordHash: DataTypes.STRING
}, {
  sequelize: MSSqlClient.instance.db,
  timestamps: true,
  paranoid: true,
  modelName: 'User',
  tableName: "users"
});
