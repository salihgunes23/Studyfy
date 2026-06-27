import { Module } from '@nestjs/common';
import { HealthController } from './common/health.controller';

/**
 * Kök modül. İlerleyen fazlarda modüller eklenecek:
 *   AuthModule, WorkspaceModule, FileModule, IngestionModule, ContentModule,
 *   ChatModule, SearchModule, QuizModule, FlashcardModule, AnalyticsModule,
 *   CoachModule, LibraryModule.
 * Sınırlar: docs/ARCHITECTURE.md §2, API: docs/API_SPEC.md.
 */
@Module({
  imports: [],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
