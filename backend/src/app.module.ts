import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { AssetsModule } from "./assets/assets.module";
import { AuditModule } from "./audit/audit.module";
import { SeedService } from "./common/seed.service";
import { AuditMiddleware } from "./common/middleware/audit.middleware";
import { User } from "./users/entities/user.entity";
import { Asset } from "./assets/entities/asset.entity";
import { AuditLog } from "./audit/entities/audit-log.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get<string>("DB_TYPE") || "sqlite";
        const isProduction =
          configService.get<string>("NODE_ENV") === "production";

        const typeormConfig: any = {
          type: dbType as "sqlite" | "postgres",
          entities: [User, Asset, AuditLog],
          synchronize: !isProduction,
          logging: !isProduction,
        };

        if (dbType === "sqlite") {
          typeormConfig.database =
            configService.get<string>("DB_PATH") || "./lite-dam.db";
        } else if (dbType === "postgres") {
          typeormConfig.host =
            configService.get<string>("DB_HOST") || "localhost";
          typeormConfig.port = configService.get<number>("DB_PORT") || 5432;
          typeormConfig.username =
            configService.get<string>("DB_USERNAME") || "postgres";
          typeormConfig.password =
            configService.get<string>("DB_PASSWORD") || "";
          typeormConfig.database =
            configService.get<string>("DB_DATABASE") || "lite-dam";
        }

        return typeormConfig;
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
    UsersModule,
    AuthModule,
    AssetsModule,
    AuditModule,
  ],
  providers: [SeedService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuditMiddleware).forRoutes("*");
  }
}
