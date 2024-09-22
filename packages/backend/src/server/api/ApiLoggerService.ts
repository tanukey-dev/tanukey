import { Injectable } from "@nestjs/common";
import type Logger from "@/logger.js";
import { LoggerService } from "@/core/LoggerService.js";

@Injectable()
export class ApiLoggerService {
	public logger: Logger;

	constructor(private loggerService: LoggerService) {
		this.logger = this.loggerService.getLogger("api");
	}
}
