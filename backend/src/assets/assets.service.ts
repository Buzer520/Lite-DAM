import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Asset } from "./entities/asset.entity";
import { UsersService } from "../users/users.service";
import { AuditService } from "../audit/audit.service";
import { UserRole } from "../users/entities/user.entity";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class AssetsService {
  private readonly uploadsDir: string;

  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    private usersService: UsersService,
    private auditService: AuditService,
    private configService: ConfigService,
  ) {
    this.uploadsDir = this.configService.get<string>('UPLOAD_DIR') || path.join(process.cwd(), "uploads");
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async create(
    createAssetDto: CreateAssetDto,
    userId: number,
    file: Express.Multer.File,
  ): Promise<Asset> {
    const user = await this.usersService.findById(userId);

    if (user.storageUsed + file.size > user.storageQuota) {
      throw new BadRequestException("Storage quota exceeded");
    }

    const decodedOriginalName = Buffer.from(
      file.originalname,
      "latin1",
    ).toString("utf-8");
    const asset = this.assetRepository.create({
      name: createAssetDto.name
        ? Buffer.from(createAssetDto.name, "latin1").toString("utf-8")
        : decodedOriginalName,
      originalName: decodedOriginalName,
      filePath: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      ownerId: userId,
      tags: createAssetDto.tags || [],
      category: createAssetDto.category,
    });

    await this.usersService.updateStorageUsed(userId, file.size);

    const savedAsset = await this.assetRepository.save(asset);

    await this.auditService.log({
      userId,
      action: "UPLOAD",
      targetType: "ASSET",
      targetId: savedAsset.id,
      details: `Uploaded asset: ${savedAsset.name}`,
    });

    return savedAsset;
  }

  async findAll(
    userId: number,
    role: UserRole,
    page = 1,
    limit = 20,
    filters: AssetFilters = {},
  ): Promise<{ assets: Asset[]; total: number }> {
    const queryBuilder = this.assetRepository
      .createQueryBuilder("asset")
      .leftJoinAndSelect("asset.owner", "owner")
      .select([
        "asset.id",
        "asset.name",
        "asset.originalName",
        "asset.mimeType",
        "asset.size",
        "asset.tags",
        "asset.category",
        "asset.createdAt",
        "asset.ownerId",
        "owner.username",
        "owner.nickname",
      ]);

    if (role === UserRole.USER) {
      queryBuilder.where("asset.ownerId = :userId", { userId });
    }

    if (filters.search) {
      queryBuilder.andWhere("asset.name LIKE :search", {
        search: `%${filters.search}%`,
      });
    }

    if (filters.category) {
      queryBuilder.andWhere("asset.category = :category", {
        category: filters.category,
      });
    }

    if (filters.ownerId) {
      queryBuilder.andWhere("asset.ownerId = :ownerId", {
        ownerId: filters.ownerId,
      });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere("asset.createdAt >= :dateFrom", {
        dateFrom: filters.dateFrom,
      });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere("asset.createdAt <= :dateTo", {
        dateTo: filters.dateTo,
      });
    }

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy("asset.createdAt", "DESC");

    const [assets, total] = await queryBuilder.getManyAndCount();

    return { assets, total };
  }

  async findOne(id: number, userId: number, role: UserRole): Promise<Asset> {
    const asset = await this.assetRepository.findOne({
      where: { id },
      relations: ["owner"],
    });

    if (!asset) {
      throw new NotFoundException("Asset not found");
    }

    if (role === UserRole.USER && asset.ownerId !== userId) {
      throw new ForbiddenException(
        "You do not have permission to view this asset",
      );
    }

    return asset;
  }

  async update(
    id: number,
    userId: number,
    role: UserRole,
    updateDto: UpdateAssetDto,
  ): Promise<Asset> {
    const asset = await this.findOne(id, userId, role);

    if (role === UserRole.USER && asset.ownerId !== userId) {
      throw new ForbiddenException("You can only edit your own assets");
    }

    if (updateDto.name) asset.name = updateDto.name;
    if (updateDto.tags) asset.tags = updateDto.tags;
    if (updateDto.category) asset.category = updateDto.category;
    if (updateDto.description) asset.description = updateDto.description;

    await this.assetRepository.save(asset);

    await this.auditService.log({
      userId,
      action: "UPDATE",
      targetType: "ASSET",
      targetId: asset.id,
      details: `Updated asset: ${asset.name}`,
    });

    return asset;
  }

  async remove(id: number, userId: number, role: UserRole): Promise<void> {
    const asset = await this.findOne(id, userId, role);

    if (role === UserRole.USER && asset.ownerId !== userId) {
      throw new ForbiddenException("You can only delete your own assets");
    }

    const filePath = path.join(this.uploadsDir, asset.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.usersService.updateStorageUsed(asset.ownerId, -asset.size);

    await this.assetRepository.remove(asset);

    await this.auditService.log({
      userId,
      action: "DELETE",
      targetType: "ASSET",
      targetId: asset.id,
      details: `Deleted asset: ${asset.name}`,
    });
  }

  async getStorageStats(): Promise<{
    totalStorage: number;
    totalAssets: number;
    userCount: number;
  }> {
    const totalStorage = await this.assetRepository
      .createQueryBuilder("asset")
      .select("SUM(asset.size)", "total")
      .getRawOne();

    const totalAssets = await this.assetRepository.count();

    return {
      totalStorage: parseInt(totalStorage?.total || "0"),
      totalAssets,
      userCount: 0,
    };
  }
}

export interface CreateAssetDto {
  name?: string;
  tags?: string[];
  category?: string;
}

export interface UpdateAssetDto {
  name?: string;
  tags?: string[];
  category?: string;
  description?: string;
}

export interface AssetFilters {
  search?: string;
  category?: string;
  ownerId?: number;
  dateFrom?: Date;
  dateTo?: Date;
}
