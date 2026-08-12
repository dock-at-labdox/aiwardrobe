import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class AppLogger extends ConsoleLogger {
  // Foundation logger: structured transport and trace exporters are added with observability work.
}
