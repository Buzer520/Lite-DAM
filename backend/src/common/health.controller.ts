import { Controller, Get } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private dataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: "健康检查接口" })
  @ApiResponse({ status: 200, description: "服务正常运行" })
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: this.dataSource?.isInitialized ? "connected" : "disconnected",
    };
  }
}